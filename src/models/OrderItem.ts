import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  HasOne,
  BeforeSave,
} from "sequelize-typescript";
import  Order  from "./Order";

@Table({ tableName: "order_items", timestamps: true })
export default class OrderItem extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Order)
  @Column(DataType.INTEGER)
  order_id!: number;

  @Column(DataType.INTEGER)
  product_id!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  })
  quantity!: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price!: number;

  @BelongsTo(() => Order)
  order!: Order;
}
