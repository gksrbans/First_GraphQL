const database = require('./database')
const { ApolloServer, gql } = require('apollo-server')


// GraphQl은 루트 타입과 반활될 데이터의 타입이 지정이 되어있음.
// teams에서 배열로 Team을 받고 Team 에서 데이터를 모델링 하듯이 만드는듯
const typeDefs = gql`
  type Query {
    teams: [Team]
    team(id: Int): Team
    equipments: [Equipment]
    supplies: [Supply]
  }

  type Mutation {
    insertEquipment(
        id: String
        used_by: String
        count: Int
        new_or_used: String
    ): Equipment

    editEquipment (
        id: String,
        used_by: String
        count: Int
        new_or_used: String
    ): Equipment

    deleteEquipment(id: String): Equipment

}

  type Team {
    id: Int
    manager: String
    office: String
    extension_number: String
    mascot: String
    cleaning_duty: String
    project: String
    supplies: [Supply]
  }

  type Equipment {
      id: String
      used_by: String
      count: Int
      new_or_used: String
  }

  type Supply {
      id: String
      team: Int
  }
`

// 리졸버는 상기 쿼리가 실질적으로 들어감.
const resolvers = {
  Query: {
    teams: () => database.teams
    .map((team) => {
        team.supplies = database.supplies
        .filter((supply) => {
            return supply.team === team.id
        })
        return team
    }),
    team: (parent, args, context, info) => database.teams.filter((team) => {
        return team.id === args.id        
    })[0],
    equipments: () => database.equipments,
    supplies: () => database.supplies
  },

  Mutation: {
    deleteEquipment: (parent, args, context, info) => {
        const deleted = database.equipments
          .filter((equipment) => {
              return equipment.id === args.id
          })[0]
        database.equipments = database.equipments
          .filter((equipment) => {
              return equipment.id != args.id
          })
        return deleted
    },

    insertEquipment: (parent, args, context, info) => {
        database.equipments.push(args)
        return args
    },

    editEquipment: (parent, args, context, info) => {
        const edit = database.equipments
          .filter((equipment) => {
              return equipment.id === args.id
          }).map((equipment) => {
              Object.assign(equipment, args)
              return equipment
          })[0]
        return edit
    },

  },
}
const server = new ApolloServer({ typeDefs, resolvers })
server.listen().then(({ url }) => {
console.log(`🚀  Server ready at ${url}`)
})