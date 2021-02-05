using SqlSugar;

namespace MysqlWebDataManager.Data.Models
{
    ///<summary>
    ///
    ///</summary>
    [SugarTable("ConnectionInfo")]
    public partial class ConnectionInfo
    {
        public ConnectionInfo()
        {


        }
        /// <summary>
        /// Desc:连接字符串
        /// Default:
        /// Nullable:True
        /// </summary>           
        public string ConnectString { get; set; }

        /// <summary>
        /// Desc:启禁用
        /// Default:1
        /// Nullable:True
        /// </summary>           
        public byte? Active { get; set; }

        /// <summary>
        /// Desc:连接id
        /// Default:
        /// Nullable:False
        /// </summary>           
        [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
        public int ConnectionId { get; set; }

        /// <summary>
        /// Desc:连接名
        /// Default:
        /// Nullable:False
        /// </summary>           
        [SugarColumn(IsPrimaryKey = true)]
        public string ConnectionName { get; set; }

    }
}
