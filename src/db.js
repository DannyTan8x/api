const mongoose = require('mongoose');

module.exports = {
  connect: (DB_HOST) => {
    /* 
   mongoDB 第7版本以上就不需要特別宣告： 
     // 使用 mongo 驅動程式更新後的URL字串
     mongoose.set('useNewUrlParse', true);
     // 使用FindeOneAndUpdate 取代 findAndModify
     mongoose.set('useFindAndModify', false);
     // 使用 create Index（） 取代 ensureIndex()
     mongoose.set('useCreateIndex', true);
     //使用新的伺服器探索和監控引擎
     mongoose.set('useUnifiedTopology', true);
     */
    mongoose.set('strictQuery', true);
    // 連接至DB
    mongoose.connect(DB_HOST);
    //若連綫失敗，記錄錯誤
    mongoose.connection.on('error', (err) => {
      console.error(err);
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running'
      );
      process.exit;
    });
  },
  close: () => {
    mongoose.connection.close();
  },
};
