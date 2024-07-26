document.addEventListener("DOMContentLoaded", function () {
    // 获取容器
    const tagsContainer = document.querySelector('.blog-tags');

    // 选取所有标签
    let tagList = Array.from(document.querySelectorAll('.blog-tags article'));
    // 博客数量最多的标签
    const maxCount = Array.from(tagList).reduce((max, article) => {
        const spans = article.querySelectorAll('span');
        const count = parseInt(spans[1].textContent.trim(), 10);
        return Math.max(max, count);
    }, 1)
    // 字体变化范围[1, 2]rem
    let per = 1 / maxCount;
    // 遍历每个文章标签
    for (let i = tagList.length - 1; i >= 0; i--) {
        // 打乱顺序
        const j = Math.floor(Math.random() * (i + 1));
        [tagList[i], tagList[j]] = [tagList[j], tagList[i]];
        // 设置字体大小
        const spans = tagList[i].querySelectorAll('span');
        const secondSpan = spans[1];
        const countText = secondSpan.textContent.trim();
        const count = parseInt(countText, 10)
        tagList[i].style.fontSize = `${1 + per * count}rem`;
        tagList[i].style.lineHeight = `4rem`;
    }
    // 重新添加标签
    tagsContainer.innerHTML = '';
    tagList.forEach(tag => {
        tagsContainer.appendChild(tag)
    })

});
