using Microsoft.AspNetCore.Http;
using MysqlWebDataManager.DbInit;
using MysqlWebDataManager.Data.Models;
using MysqlWebDataManager.Service.IService;
using System.Collections.Generic;
using System.Data;

namespace MysqlWebDataManager.Service
{
    public class ConnectionInfoService : IConnectionInfoService
    {
        private readonly SqlSugarContext _context;

        private readonly IHttpContextAccessor _httpContext;

        public ConnectionInfoService(SqlSugarContext sugarContext, IHttpContextAccessor httpContext)
        {
            _context = sugarContext;
            _httpContext = httpContext;
        }
        public (bool result, string message, List<Data.Models.ConnectionInfo> data) GetConnections()
        {
            var res = _context.ConnectionInfo.GetList();
            if (res != null && res.Count > 0)
            {
                return (true, $"已找到{res.Count}条连接", res);
            }
            return (false, "找不到任何一条连接数据", null);
        }

        public Data.Models.ConnectionInfo GetSingleConnection(string connectionName)
        {
            try
            {
                var query = _context.ConnectionInfo.AsQueryable();
                var result = query.Where(cni => cni.ConnectionName == connectionName && cni.Active == 1)
                     .First();
                return result;
            }
            catch
            {
                throw;
            }
        }

        public (bool isOpen, SqlSugar.ISqlSugarClient client) OpenDatabase(string connectString)
        {
            try
            {
                SqlSugar.ISqlSugarClient conn = new SqlSugar.SqlSugarClient(new SqlSugar.ConnectionConfig { ConnectionString = connectString, DbType = SqlSugar.DbType.MySql, IsAutoCloseConnection = true, InitKeyType = SqlSugar.InitKeyType.Attribute });
                conn.Open();
                return (true, conn);
            }
            catch
            {
                return (false, null);
            }
        }

        public List<SqlSugar.DbTableInfo> GetTableNames(SqlSugar.ISqlSugarClient client)
        {
            return client.DbMaintenance.GetTableInfoList(false);
        }

        public List<string> GetPrimaries(string tableName, SqlSugar.ISqlSugarClient client = null)
        {
            if (client == null)
            {
                return _context.Client.DbMaintenance.GetPrimaries(tableName);
            }
            return client.DbMaintenance.GetPrimaries(tableName);
        }

        public List<SqlSugar.DbColumnInfo> GetColumns(string tableName)
        {
            return _context.Client.DbMaintenance.GetColumnInfosByTableName(tableName, false);
        }

        public DataTable GetEntities(string connectionName, int pageNumber, ref int totalNumber)
        {
            return _context.TableInfo.AsQueryable()
                  .Where(table => table.ConnectionName == connectionName)
                  .ToDataTablePage(pageNumber, 15, ref totalNumber);
        }

        public (bool result, string message) AddSingleEntity(TableInfo info)
        {

            if (!_context.TableInfo.IsAny(x => x.TableName == info.TableName && x.ConnectionName == info.ConnectionName))
            {
                int res = _context
                .TableInfo
                .AsInsertable(info)
                .IgnoreColumns(tb => new { tb.Id })
                .ExecuteCommand();
                return (res > 0, "页面创建成功！刷新页面查看");
            }
            else
            {
                return (false, $"创建失败，已为连接名为{info.ConnectionName}的{info.TableName}表创建过页面！");
            }
        }

        public (bool result, string message) DisableEntities(List<TableInfo> infos)
        {
            if (infos.Count == 0)
            {
                return (false, $"请先选择至少一行数据！");
            }
            var result = _context.TableInfo.AsUpdateable(infos)
                               .UpdateColumns(tb => new { tb.Active })
                               .ExecuteCommand();
            string action = infos[0].Active == 0 ? "禁用" : "启用";
            return result > 0 ? (true, $"{action}成功！") : (false, $"{action}失败");
        }

        public (bool result, string message) DeleteEntities(List<TableInfo> infos)
        {
            if (infos.Count == 0)
            {
                return (false, "请先选择至少一行数据！");
            }
            var result = _context.TableInfo.AsDeleteable()
                                           .Where(infos)
                                           .ExecuteCommand();
            return result > 0 ? (true, "删除成功！") : (false, "删除失败");
        }

        public (bool result, string message) IsSetStatusKeyWord(IFormCollection form)
        {
            var connection_name = _httpContext.HttpContext.Request.Cookies["connection_name"];
            string keyword = _context.Client.Queryable<TableInfo>()
                              .Where(x => x.ConnectionName == connection_name && x.TableName == form["TableName"])
                              .Select(x => x.StatusKeyWord)
                              .First();
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return (false, "你还未指定一个字段作为启禁用的关键字");
            }
            return (true, "已指定的启禁用的关键字为：" + keyword);
        }

        public TableInfo GetTableInfo(IFormCollection form)
        {
            var connection_name = _httpContext.HttpContext.Request.Cookies["connection_name"];
            TableInfo info = _context.Client.Queryable<TableInfo>()
                          .Where(x => x.ConnectionName == connection_name && x.TableName == form["TableName"])
                          .Select(x => x)
                          .First();
            return info;
        }

        public (bool result, string message) SetStatusKeyWord(IFormCollection form)
        {
            try
            {
                var connection_name = _httpContext.HttpContext.Request.Cookies["connection_name"];
                TableInfo tableInfo = new TableInfo
                {
                    TableName = form["TableName"],
                    KeyWordOff = form["KeyWordOff"],
                    KeyWordOn = form["KeyWordOn"],
                    StatusKeyWord = form["StatusKeyWord"],
                    ConnectionName = connection_name
                };
                int res = _context.TableInfo.AsUpdateable(tableInfo)
                                  .Where(x => x.ConnectionName == connection_name && x.TableName == tableInfo.TableName)
                                  .UpdateColumns(x => new { x.StatusKeyWord, x.KeyWordOn, x.KeyWordOff })
                                  .ExecuteCommand();
                return res > 0 ? (true, "完成设置") : (false, "设置字段失败");
            }
            catch
            {
                return (false, "由于一些未知原因，设置字段时发生了错误！");
            }

        }

        public (bool result, string message) AddConnection(string connectionName, string connectionString)
        {
            connectionName = connectionName.Trim();
            connectionString = connectionString.Trim();
            if (string.IsNullOrWhiteSpace(connectionName) || string.IsNullOrWhiteSpace(connectionString))
            {
                return (false, "连接名和连接字符串均不能为空");
            }
            if (_context.ConnectionInfo.IsAny(x => x.ConnectionName == connectionName))
            {
                return (false, $"已存在名为{connectionName}的连接！");
            }
            int res = _context.ConnectionInfo.AsInsertable(new Data.Models.ConnectionInfo { ConnectionName = connectionName, ConnectString = connectionString })
                                     .InsertColumns(x => new { x.ConnectionName, x.ConnectString })
                                     .ExecuteCommand();
            return res > 0 ? (true, "新增连接成功！") : (false, "新增连接失败！");

        }
    }
}
