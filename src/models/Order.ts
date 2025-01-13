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
import bcrypt from "bcrypt";
import User from "./User";
import OrderItem from "./OrderItem";
import Payment from "./Payment";
import Shipment from "./Shipment";

@Table({
  tableName: "orders",
  timestamps: true,
})
export default class Order extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  order_date!: Date;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total_price!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  status: string;

  @BelongsTo(() => User)
  user!: User;

  @HasMany(() => OrderItem)
  orderItems!: OrderItem[];

  @HasOne(() => Payment)
  payment!: Payment;

  @HasOne(() => Shipment)
  shipment!: Shipment;
}
