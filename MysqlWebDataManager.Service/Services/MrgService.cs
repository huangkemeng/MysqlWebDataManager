using Microsoft.AspNetCore.Http;
using MysqlWebDataManager.Data.Models;
using MysqlWebDataManager.Service.IService;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SqlSugar;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace MysqlWebDataManager.Service
{
    public class MrgService : IMrgService
    {
        private readonly ISqlSugarClient _client;
        public MrgService(IConnectionInfoService service, IHttpContextAccessor httpContext)
        {
            var connection = service.GetSingleConnection(httpContext.HttpContext.Request.Cookies["connection_name"]);
            if (connection != null)
            {
                _client = service.OpenDatabase(connection.ConnectString).client;
            }
        }

        public List<SqlSugar.DbColumnInfo> GetColumns(string tableName)
        {
            return _client.DbMaintenance.GetColumnInfosByTableName(tableName, false);
        }

        public List<SqlSugar.DbTableInfo> GetTableNames()
        {
            return _client.DbMaintenance.GetTableInfoList(false);
        }

        public List<string> GetPrimaries(string tableName)
        {
            return _client.DbMaintenance.GetPrimaries(tableName);
        }

        public DataSet GetMrgPageData(string tableName, int pageNumber, params string[] columns)
        {
            DataSet ds = new DataSet();
            if (columns.Length > 0)
            {
                ds = _client.Ado.GetDataSetAll($@"select count(*) as count from `{tableName}` where 1=1;select {string.Join(',', columns.Select(col => $"`{col}`"))} from `{tableName}` where 1=1 limit {pageNumber * 15},15");
            }
            ds = _client.Ado.GetDataSetAll($@"select count(*) as count from `{tableName}` where 1=1;select * from `{tableName}` where 1=1 limit {pageNumber * 15},15");
            ds.Tables[0].TableName = "count";
            ds.Tables[0].TableName = "data";
            return ds;
        }

        public (bool result, string message) AddItem(IFormCollection form)
        {
            try
            {
                var filter = form.Where(x => x.Key != "TableName" && !string.IsNullOrWhiteSpace(x.Value)).ToArray();
                SugarParameter[] paras = filter.Select(x => new SugarParameter(x.Key, x.Value)).ToArray();
                string sql = $"insert into `{form["TableName"]}`({string.Join(',', filter.Select(x => $"`{x.Key}`"))}) values({string.Join(',', paras.Select(x => "@" + x.ParameterName))})";
                var result = _client.Ado.ExecuteCommand(sql, paras);
                return result > 0 ? (true, "数据新增成功！") : (false, "数据新增失败！");
            }
            catch
            {
                return (false, "有些数据格式不正确，请确保所有数据的格式正确后重新提交！");
            }

        }
        public (bool result, string message) EditItem(IFormCollection form)
        {
            try
            {
                _client.Ado.BeginTran();
                var filter = form.Where(x => x.Key != "TableName" && x.Key != "Ids" && !string.IsNullOrWhiteSpace(x.Value)).ToArray();
                var ids = JsonConvert.DeserializeObject<JArray>(form["Ids"]);
                SugarParameter[] paras = filter.Select(x => new SugarParameter(x.Key, x.Value)).ToArray();
                SugarParameter[] whereParas = ids.Select(x =>
                {
                    if (x is JObject jo)
                    {
                        return new SugarParameter(jo.Properties().FirstOrDefault().Name, jo.Properties().FirstOrDefault().Value.ToString());
                    }
                    return null;
                }).Where(x => x != null).ToArray();
                string setString = string.Join(',', paras.Select(x => $"`{x.ParameterName}`=@{x.ParameterName}"));
                string whereString = string.Join(" ", whereParas.Select(x => $"and `{x.ParameterName}`=@{x.ParameterName}")).Substring(3);
                string sql = $"update `{form["TableName"]}` set {setString} where {whereString}";
                var result = _client.Ado.ExecuteCommand(sql, paras.Concat(whereParas).ToArray());
                _client.Ado.CommitTran();
                return result > 0 ? (true, "数据修改成功！") : (false, "数据修改失败！");
            }
            catch
            {
                _client.Ado.RollbackTran();
                return (false, "有些数据格式不正确，请确保所有数据的格式正确后重新提交！");
            }

        }
        public (bool result, string message, DataTable data) GetItemById(IFormCollection form)
        {
            try
            {
                var filter = form.Where(x => x.Key != "TableName" && !string.IsNullOrWhiteSpace(x.Value)).ToArray();
                SugarParameter[] paras = filter.Select(x => new SugarParameter(x.Key, x.Value)).ToArray();
                DataTable data = _client.Ado.GetDataTable($"select * from {form["TableName"]} where 1=1 {string.Join(" ", paras.Select(x => $"and `{x.ParameterName}`=@{x.ParameterName}"))}", paras);
                if (data == null)
                {
                    return (false, "没有找到你想要的数据！", null);
                }
                return (true, "获取数据成功！", data);
            }
            catch
            {
                return (false, "查询过程中出现了些错误！", null);
            }

        }

        public (bool result, string message) EnableOrDisableItem(IFormCollection form, TableInfo info)
        {
            try
            {
                _client.Ado.BeginTran();
                JArray ManyIds = JsonConvert.DeserializeObject<JArray>(form["Ids"]);
                int status = Convert.ToInt32(form["Status"]);
                SugarParameter keyword_param = status == 1 ? new SugarParameter(info.StatusKeyWord, info.KeyWordOn) : new SugarParameter(info.StatusKeyWord, info.KeyWordOff);
                string tableName = form["TableName"];
                int parmIndex = 0;
                List<string> sqls = new List<string>();
                List<SugarParameter> sugarParams = new List<SugarParameter> { keyword_param };
                foreach (JArray Ids in ManyIds)
                {
                    parmIndex++;
                    (string origin_name, SugarParameter param)[] whereParas = Ids.Select(x =>
                     {
                         if (x is JObject jo)
                         {
                             return (jo.Properties().FirstOrDefault().Name, new SugarParameter($"{jo.Properties().FirstOrDefault().Name.ToString()}{parmIndex.ToString()}", jo.Properties().FirstOrDefault().Value.ToString()));
                         }
                         return (null, null);
                     }).Where(x => x.Item2 != null && x.Name != null).ToArray();
                    string whereString = string.Join(" ", whereParas.Select(x => $"and `{x.origin_name}` = @{x.param.ParameterName} ")).Substring(3);
                    string sql = $"update `{tableName}` set `{keyword_param.ParameterName}`=@{keyword_param.ParameterName} where {whereString} ";
                    sqls.Add(sql);
                    sugarParams.AddRange(whereParas.Select(x => x.param));
                }
                int res = _client.Ado.ExecuteCommand(string.Join(';', sqls), sugarParams);
                _client.Ado.CommitTran();
                return res > 0 ? (true, "状态修改成功！") : (false, "状态修改失败！");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                _client.Ado.RollbackTran();
                return (false, "状态修改失败");
            }
        }

        public (bool result, string message) DeleteItems(IFormCollection form)
        {
            try
            {
                _client.Ado.BeginTran();
                JArray ManyIds = JsonConvert.DeserializeObject<JArray>(form["Ids"]);
                string tableName = form["TableName"];
                int parmIndex = 0;
                List<string> sqls = new List<string>();
                List<SugarParameter> sugarParams = new List<SugarParameter>();
                foreach (JArray Ids in ManyIds)
                {
                    parmIndex++;
                    (string origin_name, SugarParameter param)[] whereParas = Ids.Select(x =>
                    {
                        if (x is JObject jo)
                        {
                            return (jo.Properties().FirstOrDefault().Name, new SugarParameter($"{jo.Properties().FirstOrDefault().Name.ToString()}{parmIndex.ToString()}", jo.Properties().FirstOrDefault().Value.ToString()));
                        }
                        return (null, null);
                    }).Where(x => x.Item2 != null && x.Name != null).ToArray();
                    string whereString = string.Join(" ", whereParas.Select(x => $"and `{x.origin_name}` = @{x.param.ParameterName} ")).Substring(3);
                    string sql = $"delete from `{tableName}` where {whereString} ";
                    sqls.Add(sql);
                    sugarParams.AddRange(whereParas.Select(x => x.param));
                }
                int res = _client.Ado.ExecuteCommand(string.Join(';', sqls), sugarParams);
                _client.Ado.CommitTran();
                return res > 0 ? (true, "所选数据已被删除！") : (false, "数据删除失败！");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
                _client.Ado.RollbackTran();
                return (false, "数据删除失败");
            }
        }

    }
}
