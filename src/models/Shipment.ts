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

@Table({ tableName: "shipments", timestamps: true })
export default class Shipment extends Model {
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
  shipment_date!: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  address!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  city!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  state!: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  country!: string;

  @Column({
    type: DataType.STRING(10),
    allowNull: false,
  })
  zip_code!: string;

  @BelongsTo(() => Order)
  order!: Order;
}
