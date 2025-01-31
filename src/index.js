// using .env variable
require('dotenv').config();
// 匯入 連綫模組
const db = require('./db');
// 匯入mongoose模組
const models = require('./models');
// create node.js server by using express
const express = require('express');
// import swagger libary
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// turning to API server by using ApolloServer
// const { ApolloServer, gql } = require('apollo-server-express'); // gql 已經已轉到 shema.js
const { ApolloServer } = require('apollo-server-express');
const port = process.env.PORT || 4000; // port config in .env is 4000
//將 DB_HOST賦予變數
const DB_HOST = process.env.DB_HOST;
//匯入 JWT 模組
const jwt = require('jsonwebtoken');
//匯入套件
const helmet = require('helmet');
//匯入 CORS套件
const cors = require('cors');

// 在檔案最上方匯入模組
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

// let notesData = [
//   { id: '1', content: 'This is a note', author: 'Adam Scott' },
//   { id: '2', content: 'This is another note', author: 'Danny Tann' },
//   { id: '3', content: 'This is the third note', author: 'Anna Chen' },
// ];
/*移轉到 Schema.js 并且換用 匯入schema 模組
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
*/

/*已轉到 resolvers 文件夾
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
*/
// 匯入 schema 模組
const typeDefs = require('./schema');

// 匯入 resolvers 模組
const resolvers = require('./resolvers');

const app = express();
//堆叠中介軟體：
app.use(helmet());
app.use(cors());

// Swagger configuration
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My A P I ',
    version: '1.0.0',
    description: 'API documentation for my Node.js app',
  },
  // ... other Swagger configuration options
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Specify the files containing your API routes
};

const swaggerSpec = swaggerJSDoc(options);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//從JWT 取得使用者資料
const getUser = (token) => {
  console.log(token);
  if (token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error('Session invalid');
    }
  }
};

//連綫 資料庫
db.connect(DB_HOST);
// Apollo 設定
// 更新 ApolloServer 加入 validationRules
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  introspection: true, // Allows introspection queries in production
  playground: true, // Enables GraphQL Playground
  context: ({ req }) => {
    const token = req.headers.authorization;
    const user = getUser(token);
    console.log('user: ', user);
    return { models, user }; //return 將 db 模型新增至 context
  },
});

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
