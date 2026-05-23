---
title: 使用Poi-tl导出Word
date: 2024-07-18T11:36:15+08:00
lastmod: 2024-07-18T11:36:15+08:00
author: Yu Yantao
draft: false
weight:
slug: poi-tl-word-export
tags: [ Java, Word ]
summary: 记录在 Java 老项目中用 Poi-tl 导出 Word 的实现过程，重点解决富文本渲染和列表数据导出这两个难点。
description: 记录在 Java 老项目中用 Poi-tl 导出 Word 的实现过程，重点解决富文本渲染和列表数据导出这两个难点。
---

> 如果文章中有不准确的地方，欢迎留言指正。

最近在维护一个 Java 老项目时，需要补一个“将列表页数据导出为 Word”的功能。这个需求表面上看不复杂，但实际做起来有两个典型难点：

1. 富文本数据怎么正确渲染到 Word 中
2. 列表里有多条数据时，怎么稳定地导出到同一个 Word 文档中

在查资料时，我最终选了 [Poi-tl](https://deepoove.com/poi-tl/)。它的好处是足够贴近模板驱动场景：富文本可以通过策略处理，列表数据也有现成支持。

## 实现思路

对应上面两个问题，我的处理方式是：

- 富文本内容通过 `HtmlRenderPolicy` 渲染
- 列表数据通过 Poi-tl 的[列表能力](https://deepoove.com/poi-tl/#_%E5%88%97%E8%A1%A8)处理

下面这段代码是项目里用来导出 Word 的核心实现：

## 核心代码

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

## 常见问题

### 依赖问题

Poi-tl是基于Apache Poi的，所以需要引入Poi的jar包，并且要注意Poi版本和Poi-tl版本对应。

如果项目中没有使用Poi，直接使用官网推荐的版本；如果项目中使用了Poi，需要根据Poi的版本选择Poi-tl版本。

### 富文本样式异常

富文本数据，使用Html渲染插件，可能会遇到如下问题。

1. 不显示背景色，0.3.3的一个bug，升级即可。
2. 表格无边框

   我们的富文本编辑器用的是WangEditor，它传入后端的HTML代码中，表格没有border属性，导致表格无边框。

   WangEditor 的官网提供了给表格添加边框的方案（通过内部样式实现），但实际导出时仍然不生效。继续往下看源码后发现，Poi-tl 的渲染插件只能处理行内样式，所以需要先把内部样式转成行内样式。

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

## 总结

这个需求真正麻烦的地方，不是“导出一个 Word 文件”，而是**如何让 Word 模板、列表数据和富文本内容稳定协作**。  
Poi-tl 在这个场景下的价值主要体现在两点：

1. 模板驱动，适合业务报表或导出文档
2. 可以通过策略扩展，处理富文本这类比纯文本更复杂的内容

如果后面再遇到类似需求，我会优先先判断两个问题：模板复杂度高不高、富文本是否需要保真。只要这两点成立，Poi-tl 依然是一个很实用的选择。
