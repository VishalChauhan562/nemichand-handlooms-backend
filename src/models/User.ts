// src/models/User.ts
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  HasMany,
  HasOne,
  BeforeSave,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import Order from "./Order";
import Cart from "./Cart";
import Wishlist from "./WishList";
import UserAddress from "./UserAddress";

@Table({ tableName: "users", timestamps: true })
export default class User extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  first_name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  last_name!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  email!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: false,
  })
  phone_number!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_admin : boolean

  @BeforeSave
  static async hashPassword(instance: User) {
    if (instance.changed("password")) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  @HasMany(() => Order)
  orders!: Order[];

  @HasOne(() => Cart)
  cart!: Cart;

  @HasOne(() => Wishlist)
  wishlist!: Wishlist;

  @HasMany(() => UserAddress)
  addresses!: UserAddress[];
}
