// src/models/UserAddress.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import User  from "./User";

@Table({ tableName: "user_addresses", timestamps: true })
export default class UserAddress extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  user_id!: number;

  @Column(DataType.STRING(100))
  address_line1!: string;

  @Column(DataType.STRING(100))
  address_line2?: string;

  @Column(DataType.STRING(100))
  city!: string;

  @Column(DataType.STRING(100))
  state!: string;

  @Column(DataType.STRING(10))
  zip_code!: string;

  @Column(DataType.STRING(100))
  country!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_default!: boolean;

  @BelongsTo(() => User)
  user!: User;
}
