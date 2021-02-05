using Microsoft.Extensions.Configuration;
using SqlSugar;

namespace MysqlWebDataManager.DbInit
{
    public class SqlSugarSetupClient : SqlSugarClient
    {
        public SqlSugarSetupClient(IConfiguration configuration) : base(new ConnectionConfig()
        {
            ConnectionString = configuration.GetConnectionString("Default"),
            DbType = DbType.MySql,
            IsAutoCloseConnection = true,
            InitKeyType = InitKeyType.Attribute
        })
        {
            Aop.OnLogExecuting = (sql, pars) =>
            {
                System.Diagnostics.Debug.WriteLine("##########################################");
                System.Diagnostics.Debug.WriteLine("Sql is \n {0} :", sql);
                foreach (var par in pars)
                {
                    System.Diagnostics.Debug.WriteLine("SqlParams is \n key={0},value = {1} :", par.ParameterName, par.Value ?? "");
                }
                System.Diagnostics.Debug.WriteLine("##########################################");
            };
        }
    }
}
