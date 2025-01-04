"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("categories");

    if (!tableInfo.desktopImage) {
      await queryInterface.addColumn("categories", "desktopImage", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "https://dummyimage.com/1200x600/000/fff",
      });
    }

    if (!tableInfo.mobileImage) {
      await queryInterface.addColumn("categories", "mobileImage", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "https://dummyimage.com/800x600/000/fff",
      });
    }

    if (!tableInfo.itemCount) {
      await queryInterface.addColumn("categories", "itemCount", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    if (!tableInfo.featured) {
      await queryInterface.addColumn("categories", "featured", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("categories", "desktopImage");
    await queryInterface.removeColumn("categories", "mobileImage");
    await queryInterface.removeColumn("categories", "itemCount");
    await queryInterface.removeColumn("categories", "featured");
  },
};
