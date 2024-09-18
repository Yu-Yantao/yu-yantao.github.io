---
title: 使用Poi-tl导出Word
date: 2024-07-18T11:36:15+08:00
lastmod: 2024-07-18T11:36:15+08:00
author: Yu Yantao
draft: false
weight:
slug: poi-tl-export-word
tags: [ Java ]
summary: 使用Poi-tl导出Word
description: 使用Poi-tl导出Word
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1.背景

最近在维护一个Java老项目，需要新增一个功能：将列表页的数据导出到Word文档中，其中列表数据包含富文本内容。

大致分析了一下，有两个难点:

1. 富文本数据如何导出到Word中
2. 列表页有很多条数据，怎么导出到一个Word中
   在网上查阅资料时，找到了[Poi-tl](https://deepoove.com/poi-tl/)这个开源库，完美解决了这两个问题。

## 2.代码实现

上述难点一，使用HtmlRenderPolicy即可；难点二，使用Poi-tl的[列表](https://deepoove.com/poi-tl/#_%E5%88%97%E8%A1%A8)即可。

```java
@Slf4j
public class WordUtils {

    /**
     * 导出word文件
     *
     * @param templateStream 模板输入流
     * @param fileName       导出文件名
     * @param data           导出的数据
     * @param htmlTags       需要渲染成html数据的标签（用于处理富文本）
     * @return 导出的文件
     * @throws IOException IOException
     */
    public static ResponseEntity<byte[]> exportWord(InputStream templateStream, String fileName, Map<String, Object> data, String... htmlTags) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        String encodedFilename = URLEncoder.encode(fileName, String.valueOf(StandardCharsets.UTF_8)).replace("+", "%20");
        headers.setContentDispositionFormData("attachment", encodedFilename);
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        try (ByteArrayOutputStream outStream = new ByteArrayOutputStream()) {
            // 配置项
            ConfigureBuilder configureBuilder = Configure.builder();
            // 使用SpringEL表达式（用于处理条件判断等复杂逻辑）
            configureBuilder.useSpringEL(true);
            // 注册html解析插件
            if (htmlTags != null) {
                // 为模板中的标签设置解析器
                HtmlRenderPolicy htmlRenderPolicy = new HtmlRenderPolicy();
                for (String tag : htmlTags) {
                    configureBuilder.bind(tag, htmlRenderPolicy);
                }
            }
            Configure configure = configureBuilder.build();
            // 加载模板并渲染数据
            XWPFTemplate template = XWPFTemplate.compile(templateStream, configure)
                    .render(data);
            // 文件名
            template.write(outStream);
            return new ResponseEntity<>(outStream.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("Failed to export word.", e);
            throw e;
        } finally {
            if (templateStream != null) {
                templateStream.close();
            }
        }
    }
}
```

## 3.常见问题

### 3.1 依赖问题

Poi-tl是基于Apache Poi的，所以需要引入Poi的jar包，并且要注意Poi版本和Poi-tl版本对应。

如果项目中没有使用Poi，直接使用官网推荐的版本；如果项目中使用了Poi，需要根据Poi的版本选择Poi-tl版本。

### 3.2 富文本数据样式异常

富文本数据，使用Html渲染插件，可能会遇到如下问题。

1. 不显示背景色，0.3.3的一个bug，升级即可。
2. 表格无边框

   我们的富文本编辑器用的是WangEditor，它传入后端的HTML代码中，表格没有border属性，导致表格无边框。

   WandEditor的官网提供了给表格添加边框的方案（是添加内部样式），尝试后无法解决问题，尝试阅读源码后发现，渲染插件只能处理行内样式，所以需要将内部样式转为行内样式。

   这是一个在后端将内部样式转为行内样式的代码，也可以在前端做。
   ```java
    /**
     * 表格样式
     */
    public static final String TABLE_CSS_STYLE = "table{border-collapse:collapse;border:1px solid #000;border-spacing:0}th,td,tr{border:1px solid #000}";

    /**
     * 解决导出的Word中表格没有边框的问题
     * <p>
     * 问题原因：
     * 前端传入的富文本内容中，仅有HTML内容和部分样式，表格边框样式没有（wangEditor默认处理方式），导致导出时边框不显示
     * <p>
     * 解决方式：
     * 后端处理富文本内容时，手动为表格添加样式
     * 但是使用的组件POI-TL解析不到style标签中的样式，所以需要将style中的内联样式转换为行内样式
     *
     * @param html html字符串
     * @param css  css 字符串
     */
    public static String cssToHtml(String html, String css) {
        Document document = Jsoup.parseBodyFragment(html);
        CSSOMParser parser = new CSSOMParser();
        InputSource source = new InputSource(new StringReader(css));
        CSSRuleList ruleList = null;
        try {
            ruleList = parser.parseStyleSheet(source, null, null).getCssRules();
        } catch (IOException e) {
            log.error("Error occurred while converting CSS to HTML", e);
        }

        for (int i = 0; i < Objects.requireNonNull(ruleList).getLength(); i++) {
            if (ruleList.item(i) instanceof CSSStyleRuleImpl) {
                CSSStyleRuleImpl rule = (CSSStyleRuleImpl) ruleList.item(i);
                String selector = rule.getSelectorText();
                CSSStyleDeclaration style = rule.getStyle();

                Elements elements = document.select(selector);
                for (Element element : elements) {
                    StringBuilder inlineStyle = new StringBuilder();

                    // 保留已有的style属性
                    if (element.hasAttr("style")) {
                        inlineStyle.append(element.attr("style"));
                        if (inlineStyle.charAt(inlineStyle.length() - 1) != ';') {
                            inlineStyle.append(';');
                        }
                    }

                    // 追加新的CSS属性
                    for (int j = 0; j < style.getLength(); j++) {
                        String property = style.item(j);
                        String value = style.getPropertyValue(property);
                        inlineStyle.append(property).append(':').append(value).append(';');
                    }

                    element.attr("style", inlineStyle.toString());
                }
            }
        }
        return document.html();
    }
   ```
