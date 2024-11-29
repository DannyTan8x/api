// using .env variable
require('dotenv').config();
// 匯入 連綫模組
const db = require('./db');
// 匯入模組
const models = require('./models');
// create node.js server by using express
const express = require('express');
// turning to API server by using ApolloServer
const { ApolloServer, gql } = require('apollo-server-express');
const port = process.env.PORT || 3000; // port config in .env is 4000
//將 DB_HOST賦予變數
const DB_HOST = process.env.DB_HOST;

let notesData = [
  { id: '1', content: 'This is a note', author: 'Adam Scott' },
  { id: '2', content: 'This is another note', author: 'Danny Tann' },
  { id: '3', content: 'This is the third note', author: 'Anna Chen' },
];
// using GraphQL to initialize 用 GraphQL 結構描述語言 建立結構描述
const typeDefs = gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }
  type Query {
    hello: String
    notes: [Note!]!
    note(id: ID!): Note!
  }
  type Mutation {
    newNote(content: String!, author: String!): Note!
  }
`;
// 為結構描述欄位提供解析程式函式
const resolvers = {
  Query: {
    hello: () => 'Hello Query!',
    // notes: () => notesData,
    // 換用資料庫查詢find()， 而不再用記憶體
    notes: async () => {
      return await models.Note.find();
    },
    // note: (parent, args) => {
    // return notesData.find((note) => note.id === args.id);

    // },
    note: async (parent, args) => {
      return await models.Note.findById(args.id);
    },
  },

  Mutation: {
    // newNote: (parent, args) => {
    //   let noteValue = {
    //     id: String(notesData.length + 1),
    //     content: args.content,
    //     author: 'Danny Tan',
    //   };
    //   notesData.push(noteValue);
    //   return noteValue;
    // },
    newNote: async (parent, args) => {
      return await models.Note.create({
        content: args.content,
        author: args.author,
      });
    },
  },
};

const app = express();

//連綫 資料庫
db.connect(DB_HOST);
// Apollo 設定
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();
  // 套用 Apollo Graph QL 中介軟體並將路徑設定 為 /api
  server.applyMiddleware({ app, path: '/api' });

  app.listen({ port }, () =>
    console.log(
      `GraphQL Server running at http://localhost:${port}${server.graphqlPath}`
    )
  );
}
startServer();
