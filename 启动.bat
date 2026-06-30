@echo off
chcp 65001 >nul
title 校园服务平台 - 一键启动

echo ========================================
echo    校园综合服务平台 - 启动中
echo ========================================
echo.

echo [1/2] 启动后端API服务...
start "后端服务" /D "%~dp0" cmd /k "node api/server.js"

timeout /t 2 /nobreak >nul

echo [2/2] 启动前端开发服务...
start "前端服务" /D "%~dp0" cmd /k "npx vite"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    启动完成！
echo ========================================
echo.
echo 学生前台: http://localhost:5173/
echo 超级管理员: http://localhost:5173/super-admin/login
echo 代理后台: http://localhost:5173/agent/login
echo 后端API: http://localhost:40000
echo.
echo 超级管理员账号: 13800138000
echo 代理测试账号: agent001
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:5173/
