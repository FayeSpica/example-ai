# ChatBI 快速启动指南

## 🚀 快速开始

### 方式一：自动启动脚本（推荐）

```bash
# 1. 克隆项目到本地
cd /workspace

# 2. 运行自动启动脚本
./start_system.sh
```

### 方式二：Docker 启动（最简单）

```bash
# 1. 启动所有服务
docker-compose up -d

# 2. 等待服务启动完成（约2-3分钟）
docker-compose logs -f

# 3. 访问应用
# 前端: http://localhost
# 后端API: http://localhost:8000
```

### 方式三：手动启动

#### 1. 启动 Ollama
```bash
ollama serve
ollama pull llama2  # 或其他模型
```

#### 2. 启动后端服务器
```bash
cd chatbi-server

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 配置环境变量（编辑 .env 文件）
# DATABASE_URL=mysql+pymysql://用户名:密码@localhost:3306/数据库名

# 运行测试（可选）
python test_setup.py

# 启动服务器
python run.py
```

#### 3. 启动前端服务器
```bash
cd chatbi-ui

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📝 配置说明

### 后端配置 (`chatbi-server/.env`)
```env
# 数据库连接
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/chatbi_db

# Ollama 配置
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2

# API 配置
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
```

### 前端配置 (`chatbi-ui/.env`)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## 🔧 依赖要求

### 系统要求
- Python 3.8+
- Node.js 16+
- MySQL 5.7+ 或 8.0+
- Ollama（用于AI模型）

### Python 依赖
- FastAPI
- LangChain
- Ollama
- SQLAlchemy
- PyMySQL

### Node.js 依赖
- React 18
- Material-UI
- Vite
- Axios
- TypeScript

## 🌐 访问地址

启动成功后，可以访问：

- **前端界面**: http://localhost:5173 (开发) 或 http://localhost (Docker)
- **后端API**: http://localhost:8000
- **API文档**: http://localhost:8000/docs
- **ReDoc文档**: http://localhost:8000/redoc

## 📊 示例查询

启动成功后，可以尝试以下自然语言查询：

1. **用户查询**
   - "显示所有活跃用户"
   - "查找年龄大于30的用户"
   - "统计每个城市的用户数量"

2. **产品查询**
   - "显示所有电子产品"
   - "查找价格低于100的产品"
   - "按类别统计产品数量"

3. **订单查询**
   - "显示本月的所有订单"
   - "查找总金额超过500的订单"
   - "统计每个用户的订单数量"

4. **复杂查询**
   - "显示销量最高的5个产品"
   - "查找最近30天没有下单的用户"
   - "按月统计今年的销售额"

## 🔍 故障排除

### 常见问题

1. **Ollama 连接失败**
   ```bash
   # 检查 Ollama 是否运行
   curl http://localhost:11434/api/tags
   
   # 启动 Ollama
   ollama serve
   
   # 拉取模型
   ollama pull llama2
   ```

2. **数据库连接失败**
   - 检查 MySQL 是否运行
   - 验证数据库凭据
   - 确保数据库已创建

3. **前端无法连接后端**
   - 检查后端服务器是否运行在 8000 端口
   - 验证 CORS 设置
   - 检查防火墙设置

4. **SQL 生成质量差**
   - 刷新数据库架构信息
   - 检查表和列的注释是否完整
   - 尝试更具体的自然语言描述

### 日志查看

```bash
# 后端日志
tail -f chatbi-server/logs/app.log

# Docker 日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🎯 下一步

1. **数据库设置**: 连接你的真实数据库
2. **模型优化**: 尝试不同的 Ollama 模型
3. **自定义界面**: 根据需要修改前端界面
4. **部署**: 使用 Docker 部署到生产环境

## 📚 更多信息

- [完整文档](README.md)
- [后端文档](chatbi-server/README.md)
- [前端文档](chatbi-ui/README.md)
- [API 文档](http://localhost:8000/docs)

## 💡 提示

- 首次使用建议先运行测试脚本验证环境
- 数据库架构信息对 SQL 生成质量很重要
- 可以通过界面刷新架构信息
- 支持中英文自然语言查询