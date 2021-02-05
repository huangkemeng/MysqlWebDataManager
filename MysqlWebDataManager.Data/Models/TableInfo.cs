using SqlSugar;

namespace MysqlWebDataManager.Data.Models
{
    ///<summary>
    ///
    ///</summary>
    [SugarTable("TableInfo")]
    public partial class TableInfo
    {
        public TableInfo()
        {


        }
        /// <summary>
        /// Desc:表名
        /// Default:
        /// Nullable:False
        /// </summary>           
        public string TableName { get; set; }

        /// <summary>
        /// Desc:启禁用
        /// Default:1
        /// Nullable:False
        /// </summary>           
        public byte Active { get; set; }

        /// <summary>
        /// Desc:哪个关键字启禁用
        /// Default:
        /// Nullable:True
        /// </summary>           
        public string StatusKeyWord { get; set; }

        /// <summary>
        /// Desc:启用的值
        /// Default:
        /// Nullable:True
        /// </summary>           
        public string KeyWordOn { get; set; }

        /// <summary>
        /// Desc:禁用的值
        /// Default:
        /// Nullable:True
        /// </summary>           
        public string KeyWordOff { get; set; }

        /// <summary>
        /// Desc:连接和实体关系id
        /// Default:
        /// Nullable:False
        /// </summary>           
        [SugarColumn(IsPrimaryKey = true, IsIdentity = true)]
        public int Id { get; set; }

        /// <summary>
        /// Desc:连接名
        /// Default:
        /// Nullable:False
        /// </summary>           
        public string ConnectionName { get; set; }

    }
}
