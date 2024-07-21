document.addEventListener("DOMContentLoaded", function () {
    // 获取椭圆容器
    const blog_tags = document.getElementById('blog-tags');

    // 获取椭圆的实际宽度和高度
    const ellipseWidth = blog_tags.offsetWidth;
    const ellipseHeight = blog_tags.offsetHeight;

    // 选取所有文章标签
    let articleList = document.querySelectorAll('#blog-tags article');

    // 遍历每个文章标签
    articleList.forEach((element, index) => {
        // 计算文章标签分布的角度
        const angle = (index / articleList.length) * 2 * Math.PI;

        // 随机生成横向和纵向半径
        const radiusX = (ellipseWidth / 2) * 0.8 * (Math.random() * 0.5 + 0.5);
        const radiusY = (ellipseHeight / 2) * 0.8 * (Math.random() * 0.5 + 0.5);

        // 根据角度和半径计算文章标签的位置
        const x = ellipseWidth / 2 + radiusX * Math.cos(angle);
        const y = ellipseHeight / 2 + radiusY * Math.sin(angle);

        // 设置文章标签的位置，确保其不会超出椭圆边界
        element.style.left = `${x - element.offsetWidth / 2}px`;
        element.style.top = `${y - element.offsetHeight / 2}px`;
    });
});
