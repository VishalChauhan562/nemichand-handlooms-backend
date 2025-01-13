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
import Order from "./Order";

@Table({ tableName: "payments", timestamps: true })
export default class Payment extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => Order)
  @Column(DataType.INTEGER)
  order_id!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  payment_date!: Date;

  @Column({
    type: DataType.ENUM("CARD", "UPI", "NETBANKING", "CASH", "razorpay"),
    allowNull: false,
  })
  payment_method!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  razorpay_order_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  status!: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount!: number;

  @BelongsTo(() => Order)
  order!: Order;
}
