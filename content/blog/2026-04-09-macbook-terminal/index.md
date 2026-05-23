---
title: MacBook 终端环境配置
date: 2026-04-09T19:07:09+08:00
lastmod: 2026-04-09T19:07:09+08:00
author: Yu Yantao
draft: false
weight:
slug: macbook-terminal
tags: [ macOS, Terminal ]
summary: 整理我在 MacBook 上搭建终端环境的实际配置，包括 Kitty、Oh My Zsh 和 Starship，以及这套组合主要解决什么问题。
description: 整理我在 MacBook 上搭建终端环境的实际配置，包括 Kitty、Oh My Zsh 和 Starship，以及这套组合主要解决什么问题。
---

> 如果文章中有不准确的地方，欢迎留言指正。

## 1 说明

- **Kitty** 负责终端能力本身，例如分屏、标签页和字体渲染
- **Oh My Zsh** 负责 shell 生态和插件管理
- **Starship** 负责提示符展示，让 Git、语言运行时等信息更容易读取

## 2 Kitty

我选择 Kitty，主要是因为它足够轻，同时在键位映射、分屏和外观配置上都比较顺手，比较适合作为长期主力终端。

### 2.1 安装

```shell
brew install --cask kitty
```

### 2.2 配置

配置文件路径：`~/.config/kitty/kitty.conf`

```text
# ==========================================
# Kitty 终端配置
# ==========================================

# ------------------------------------------
# 字体与外观
# ------------------------------------------
# 字体设置
font_family      font-maple-mono-nl-nf-cn
font_size        14.0

# 背景透明度
background_opacity 1
dynamic_background_opacity yes

# 窗口边缘内边距
window_padding_width 10

hide_window_decorations no
# macos_titlebar_color dark

# ------------------------------------------
# 窗口行为与历史记录
# ------------------------------------------
# 启动时不记忆上次大小，使用固定尺寸
remember_window_size  no
initial_window_width  1000
initial_window_height 618

# 关闭窗口时不弹出确认提示
confirm_os_window_close 0

# 向上滚动的历史行数
scrollback_lines 10000

# 禁用终端提示音
enable_audio_bell no

# ------------------------------------------
# 交互与远程控制
# ------------------------------------------
# 允许远程控制 (使用 Kitty 主题切换工具必需)
allow_remote_control yes

# 选中文本自动复制到剪贴板
copy_on_select yes

# 复制时去除行尾多余空格
strip_trailing_spaces smart

# ------------------------------------------
# 标签页 UI
# ------------------------------------------
# Powerline 风格底部标签栏
tab_bar_edge bottom
tab_bar_style powerline
tab_powerline_style slanted
tab_title_template "{index}: {title}"

# ------------------------------------------
# 快捷键映射
# ------------------------------------------

# --- 窗口分割 ---
# 必须启用 splits 布局才能使用下方自定义分割
enabled_layouts splits

# cmd+d 下方分屏
map cmd+d launch --location=hsplit
# cmd+r 右侧分屏
map cmd+r launch --location=vsplit
# cmd+w 关闭当前分屏/窗口
map cmd+w close_window

# --- 分屏焦点切换 ---
# 使用 cmd + 方向键在分屏间移动光标
map cmd+left  neighboring_window left
map cmd+right neighboring_window right
map cmd+up    neighboring_window up
map cmd+down  neighboring_window down

# --- 分屏尺寸调整 ---
# 使用 cmd + shift + 方向键调整分割线
map cmd+shift+left  resize_window narrower
map cmd+shift+right resize_window wider
map cmd+shift+up    resize_window taller
map cmd+shift+down  resize_window shorter

# --- 标签页管理 ---
map cmd+t new_tab
map cmd+shift+[ previous_tab
map cmd+shift+] next_tab

# --- 配置管理 ---
# 编辑配置文件
map cmd+, edit_config_file
# 热重载配置 (不重启应用生效)
map cmd+ctrl+, load_config_file

# BEGIN_KITTY_THEME
# GitHub Light
include current-theme.conf
# END_KITTY_THEME
```

设置主题

```shell
kitty +kitten themes
```

## 3 Oh My Zsh

Shell 层面我没有追求复杂配置，重点是把高频、真正能降低输入成本的能力补上。

### 3.1 安装

先安装 Oh My Zsh：

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

安装第三方插件：

```shell
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

### 3.2 配置

```shell
setopt no_nomatch

export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME=""
plugins=(git last-working-dir extract brew zsh-autosuggestions zsh-syntax-highlighting)
source $ZSH/oh-my-zsh.sh

eval "$(starship init zsh)"
```

- `git`：提供大量 Git alias 和函数，减少重复输入。
- `last-working-dir`：记住上一次目录，新开终端自动回到最近工作目录。
- `extract`：统一用 `extract <文件>` 解压常见压缩格式。
- `brew`：提供 Homebrew 常用 alias，并自动处理 shellenv。
- `zsh-autosuggestions`：基于历史命令给出灰色自动补全建议。
- `zsh-syntax-highlighting`：命令输入时语法高亮，提前发现拼写/语法问题。

加载配置

```shell
source ~/.zshrc
```

## 4 Starship

提示符我最终选择了 Starship。它的优点是配置简单、生态成熟，而且跨语言、跨项目时展示信息比较统一。

### 4.1 安装

```shell
brew install starship
```

### 4.2 配置

配置文件路径：`~/.config/starship.toml`

```toml
"$schema" = 'https://starship.rs/config-schema.json'

format = """
[](color_orange)\
$os\
$username\
[](fg:color_orange bg:color_yellow)\
$directory\
[](fg:color_yellow bg:color_aqua)\
$git_branch\
[](fg:color_aqua bg:color_bg3)\
$conda\
[](fg:color_bg3)\
"""

palette = 'gruvbox_dark'

[palettes.gruvbox_dark]
color_fg0 = '#fbf1c7'
color_bg1 = '#3c3836'
color_bg3 = '#665c54'
color_blue = '#458588'
color_aqua = '#689d6a'
color_green = '#98971a'
color_orange = '#d65d0e'
color_purple = '#b16286'
color_red = '#cc241d'
color_yellow = '#d79921'

[os]
disabled = false
style = "bg:color_orange fg:color_fg0"

[os.symbols]
Windows = "󰍲"
Ubuntu = "󰕈"
SUSE = ""
Raspbian = "󰐿"
Mint = "󰣭"
Macos = "󰀵"
Manjaro = ""
Linux = "󰌽"
Gentoo = "󰣨"
Fedora = "󰣛"
Alpine = ""
Amazon = ""
Android = ""
AOSC = ""
Arch = "󰣇"
Artix = "󰣇"
EndeavourOS = ""
CentOS = ""
Debian = "󰣚"
Redhat = "󱄛"
RedHatEnterprise = "󱄛"
Pop = ""

[username]
show_always = true
style_user = "bg:color_orange fg:color_fg0"
style_root = "bg:color_orange fg:color_fg0"
format = '[ $user ]($style)'

[directory]
style = "fg:color_fg0 bg:color_yellow"
format = "[ $path ]($style)"
truncation_length = 3
truncation_symbol = "…/"

[git_branch]
symbol = ""
style = "bg:color_aqua"
format = '[[ $symbol $branch ](fg:color_fg0 bg:color_aqua)]($style)'

[conda]
style = "bg:color_bg3"
format = '[[ $symbol( $environment) ](fg:#83a598 bg:color_bg3)]($style)'%
```
