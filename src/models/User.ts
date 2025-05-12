
import { Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull } from 'sequelize-typescript'
import Appointment from './Appointment'

@Table({
	tableName: 'users'
})

class User extends Model {

	@AllowNull(false)
	@Column({
		type: DataType.STRING(20)
	})
	declare documento: string

	@AllowNull(false)
	@Column({
		type: DataType.STRING(100)

	})
	declare name: string

	@Unique(true)
	@AllowNull(false)
	@Column({
		type: DataType.STRING(50)
	})
	declare email: string

	@AllowNull(false)
	@Column({
		type: DataType.STRING(60)
	})
	declare password: string

	@Column({
		type: DataType.STRING(6)
	})
	declare token: string

	@Default(false)
	@Column({
		type: DataType.BOOLEAN
	})
	declare confirmed: boolean

	@AllowNull(false)
	@Column({
		type: DataType.ENUM('admin', 'client'),
		defaultValue: 'client'
	})
	declare role: 'admin' | 'client'

	@AllowNull(true)
	@Column({
		type: DataType.STRING
	})
	declare data: string

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true
	})
	declare is_active: boolean

	@HasMany(() => Appointment, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	declare appointments: Appointment[]
}

export default User