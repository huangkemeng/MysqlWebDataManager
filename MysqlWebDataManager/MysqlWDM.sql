

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for ConnectionInfo
-- ----------------------------
DROP TABLE IF EXISTS `ConnectionInfo`;
CREATE TABLE `ConnectionInfo`  (
  `ConnectionId` int NOT NULL AUTO_INCREMENT COMMENT '连接id',
  `ConnectionName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '连接名',
  `ConnectString` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '连接字符串',
  `Active` tinyint(1) NULL DEFAULT 1 COMMENT '启禁用',
  PRIMARY KEY (`ConnectionId`, `ConnectionName`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 9 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Table structure for TableInfo
-- ----------------------------

DROP TABLE IF EXISTS `TableInfo`;
CREATE TABLE `TableInfo`  (
  `Id` int NOT NULL AUTO_INCREMENT COMMENT '连接和实体关系id',
  `ConnectionName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '连接名',
  `TableName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '表名',
  `Active` tinyint NOT NULL DEFAULT 1 COMMENT '启禁用',
  `StatusKeyWord` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '哪个关键字启禁用',
  `KeyWordOn` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '启用的值',
  `KeyWordOff` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '禁用的值',
  PRIMARY KEY (`Id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 58 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
