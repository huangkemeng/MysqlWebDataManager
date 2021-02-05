using MysqlWebDataManager.Data.Models;
using SqlSugar;
namespace MysqlWebDataManager.DbInit
{
    public class SqlSugarContext
    {
        private readonly ISqlSugarClient client;
        public SqlSugarContext(ISqlSugarClient sqlSugarClient)
        {
            client = sqlSugarClient;
        }
        public ISqlSugarClient Client { get { return client; } }

        public SimpleClient<ConnectionInfo> ConnectionInfo { get { return new SimpleClient<ConnectionInfo>(client); } }

        public SimpleClient<TableInfo> TableInfo { get { return new SimpleClient<TableInfo>(client); } }
    }
}
