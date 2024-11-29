//要求 mongoose 函數庫
const mongoose = require('mongoose');
//定義注記的資料庫機構描述
const noteShema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  },
  {
    //使用Date 類型指派 createAt 和 updateAt 欄位
    timestamps: true,
  }
);
//使用機構描述定義 [Note] 模型
const Note = mongoose.model('Note', noteShema);
//匯出模組
module.exports = Note;
