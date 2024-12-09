const { models, Cursor } = require('mongoose');

// models 從context 取用
module.exports = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },
  note: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },
  noteFeed: async (parent, { cursor }, { models }) => {
    //將限制硬編碼為10個項目
    const limit = 2;
    //將預設的 hasNextPage 值設爲false
    let hasNextPage = false;
    // 若未傳遞游標， 側預設查詢將是空的
    //這將從cb 提取最新的注記
    let cursorQuery = {};
    //如果有游標
    //查詢將尋找ObjectId 小於游標注記
    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }
    //在db 中尋找限制 + 1 個注記， 從最新到最舊排序
    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    //如果尋找的注記數量超過限制
    //將 hasNextPage 設爲 true  並將注記調整至限制
    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, -1);
    }

    // 新游標將是摘要陣列中最後一項的 Mogno 物件ID
    const newCursor = notes[notes.length - 1]._id;
    return {
      notes,
      cursor: newCursor,
      hasNextPage,
    };
  },
  user: async (parent, { username }, { models }) => {
    return await models.User.findOne({ username });
  },
  users: async (parent, args, { models }) => {
    return await models.User.find({});
  },
  me: async (parent, args, { models, user }) => {
    return await models.User.findById(user.id);
  },
};
