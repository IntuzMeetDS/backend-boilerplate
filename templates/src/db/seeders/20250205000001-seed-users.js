'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    
    await queryInterface.bulkInsert('users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'john.doe@example.com',
        name: 'John Doe',
        age: 30,
        status: 1,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        age: 28,
        status: 1,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'bob.wilson@example.com',
        name: 'Bob Wilson',
        age: 35,
        status: 1,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        email: 'alice.johnson@example.com',
        name: 'Alice Johnson',
        age: 42,
        status: 0,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        email: 'charlie.brown@example.com',
        name: 'Charlie Brown',
        age: 25,
        status: 1,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', {
      email: {
        [Sequelize.Op.in]: [
          'john.doe@example.com',
          'jane.smith@example.com',
          'bob.wilson@example.com',
          'alice.johnson@example.com',
          'charlie.brown@example.com',
        ],
      },
    }, {});
  }
};
