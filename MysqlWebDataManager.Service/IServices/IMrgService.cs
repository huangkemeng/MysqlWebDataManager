using Microsoft.AspNetCore.Http;
using MysqlWebDataManager.Data.Models;
using System.Collections.Generic;
using System.Data;

namespace MysqlWebDataManager.Service.IService
{
    public interface IMrgService
    {
        List<SqlSugar.DbColumnInfo> GetColumns(string tableName);
        List<SqlSugar.DbTableInfo> GetTableNames();
        List<string> GetPrimaries(string tableName);
        DataSet GetMrgPageData(string tableName, int pageNumber, params string[] columns);
        (bool result, string message) AddItem(IFormCollection form);
        (bool result, string message, DataTable data) GetItemById(IFormCollection form);
        (bool result, string message) EditItem(IFormCollection form);
        (bool result, string message) EnableOrDisableItem(IFormCollection form, TableInfo info);

        (bool result, string message) DeleteItems(IFormCollection form);

    }
}
