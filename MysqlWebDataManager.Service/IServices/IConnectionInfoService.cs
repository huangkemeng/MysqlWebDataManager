using System.Collections.Generic;
using MysqlWebDataManager.Data.Models;
using System.Data;
using Microsoft.AspNetCore.Http;

namespace MysqlWebDataManager.Service.IService
{
    public interface IConnectionInfoService
    {
        Data.Models.ConnectionInfo GetSingleConnection(string connectionName);
        (bool isOpen, SqlSugar.ISqlSugarClient client) OpenDatabase(string connectString);

        List<SqlSugar.DbTableInfo> GetTableNames(SqlSugar.ISqlSugarClient client);

        List<SqlSugar.DbColumnInfo> GetColumns(string tableName);

        DataTable GetEntities(string connectionName, int pageNumber, ref int totalNumber);

        (bool result, string message) AddSingleEntity(TableInfo info);

        List<string> GetPrimaries(string tableName, SqlSugar.ISqlSugarClient client = null);
        (bool result, string message) DisableEntities(List<TableInfo> infos);

        (bool result, string message) DeleteEntities(List<TableInfo> infos);
        (bool result, string message) IsSetStatusKeyWord(IFormCollection form);
        TableInfo GetTableInfo(IFormCollection form);

        (bool result, string message) SetStatusKeyWord(IFormCollection form);
        (bool result, string message, List<Data.Models.ConnectionInfo> data) GetConnections();

        (bool result, string message) AddConnection(string connectionName, string connectionString);
    }
}
