using Microsoft.AspNetCore.Mvc;
using MysqlWebDataManager.Data.Models;
using MysqlWebDataManager.Service.IService;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace MysqlWebDataManager.Controllers
{
    [Route("[controller]/[action]")]
    public class EntityController : Controller
    {
        private readonly IConnectionInfoService _service;
        public EntityController(IConnectionInfoService service)
        {
            _service = service;
        }
        public IActionResult Index()
        {
            string pageNumberRaw = Request.Query["pageNumber"];
            string connectName = Request.Cookies["connection_name"];
            int pageNumber = 1;
            if (int.TryParse(pageNumberRaw, out int pn))
            {
                if (!(pn > 0))
                {
                    pageNumber = 1;
                }
                else
                {
                    pageNumber = pn;
                }
            }
            else
            {
                pageNumber = 1;
            }
            var connection = GetConnectionInfo(connectName);
            ViewBag.IsConnected = false;
            if (connection != null)
            {
                var openResult = OpenDatabase(connection.ConnectString);
                if (openResult.isOpen)
                {
                    ViewBag.IsConnected = true;
                    int totalNumber = 0;
                    var table = GetEntities(connection.ConnectionName, pageNumber, ref totalNumber);
                    ViewBag.CurrentPage = pageNumber;
                    ViewBag.TotalNumber = totalNumber;
                    ViewBag.Head = GetColumnInfos(nameof(TableInfo));
                    ViewBag.Rows = table.Rows;
                    ViewBag.Keys = GetPrimaries(nameof(TableInfo));
                    ViewBag.TableNames = GetTables(openResult.conn);
                }
                else
                    ViewBag.ConnectName = connectName;
            }
            return View();
        }

        public IActionResult AddSingleEntity(string tableName, int active)
        {
            string connectName = Request.Cookies["connection_name"];
            if (!string.IsNullOrWhiteSpace(connectName))
            {
                TableInfo info = new TableInfo
                {
                    ConnectionName = connectName,
                    TableName = tableName,
                    Active = 1
                };
                var result = _service.AddSingleEntity(info);
                return Ok(new { result.result, result.message });
            }
            return Ok(new { result = false, message = "连接信息已过期" });
        }
        public IActionResult EnableEntities(string data)
        {
            try
            {
                JObject jparam = JsonConvert.DeserializeObject<JObject>(data);
                if (jparam.TryGetValue("tableName", out JToken token))
                {
                    var tableName = token.Value<string>();
                }
                List<TableInfo> tables = new List<TableInfo>();
                if (jparam.TryGetValue("where", out JToken where_token))
                {
                    if (where_token is JObject where)
                    {
                        if (where.TryGetValue("Id", out JToken jids))
                        {
                            if (jids is JArray ids)
                            {
                                foreach (var id in ids)
                                {
                                    tables.Add(new TableInfo { Id = id.Value<int>(), Active = 1 });
                                }
                            }
                        }
                    }
                }
                var res = _service.DisableEntities(tables);
                return Ok(new { res.result, res.message });
            }
            catch
            {
                return Ok(new { result = false, message = "参数错误，请按照{data:json}的格式传输" });
            }
        }

        public IActionResult DisableEntities(string data)
        {
            try
            {
                JObject jparam = JsonConvert.DeserializeObject<JObject>(data);
                if (jparam.TryGetValue("tableName", out JToken token))
                {
                    var tableName = token.Value<string>();
                }
                List<TableInfo> tables = new List<TableInfo>();
                if (jparam.TryGetValue("where", out JToken where_token))
                {
                    if (where_token is JObject where)
                    {
                        if (where.TryGetValue("Id", out JToken jids))
                        {
                            if (jids is JArray ids)
                            {
                                foreach (var id in ids)
                                {
                                    tables.Add(new TableInfo { Id = id.Value<int>(), Active = 0 });
                                }
                            }
                        }
                    }
                }
                var res = _service.DisableEntities(tables);
                return Ok(new { res.result, res.message });
            }
            catch
            {
                return Ok(new { result = false, message = "参数错误，请按照{data:json}的格式传输" });
            }
        }


        public IActionResult DeleteEntities(string data)
        {
            try
            {
                JObject jparam = JsonConvert.DeserializeObject<JObject>(data);
                if (jparam.TryGetValue("tableName", out JToken token))
                {
                    var tableName = token.Value<string>();
                }
                List<TableInfo> tables = new List<TableInfo>();
                if (jparam.TryGetValue("where", out JToken where_token))
                {
                    if (where_token is JObject where)
                    {
                        if (where.TryGetValue("Id", out JToken jids))
                        {
                            if (jids is JArray ids)
                            {
                                foreach (var id in ids)
                                {
                                    tables.Add(new TableInfo { Id = id.Value<int>() });
                                }
                            }
                        }
                    }
                }
                var res = _service.DeleteEntities(tables);
                return Ok(new { res.result, res.message });
            }
            catch
            {
                return Ok(new { result = false, message = "参数错误，请按照{data:json}的格式传输" });
            }
        }

        private Data.Models.ConnectionInfo GetConnectionInfo(string connectName)
        {
            return _service.GetSingleConnection(connectName);
        }

        private (bool isOpen, SqlSugar.ISqlSugarClient conn) OpenDatabase(string connectSting)
        {
            (bool isOpen, SqlSugar.ISqlSugarClient conn) result = _service.OpenDatabase(connectSting);
            return result;
        }

        private DataTable GetEntities(string connectionName, int pageNumber, ref int totalNumber)
        {
            return _service.GetEntities(connectionName, pageNumber, ref totalNumber);
        }

        private List<string> GetTables(SqlSugar.ISqlSugarClient client)
        {
            return _service.GetTableNames(client).Select(x => x.Name).ToList();
        }

        public List<string> GetPrimaries(string tableName)
        {
            return _service.GetPrimaries(tableName);
        }

        public List<SqlSugar.DbColumnInfo> GetColumnInfos(string tableName)
        {
            return _service.GetColumns(tableName);
        }
    }
}