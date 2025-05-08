
import {Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull} from 'sequelize-typescript'
import Appointment from './Appointment'

@Table({
	tableName: 'users'
})

class User extends Model {
	@AllowNull(false)
	@Column({
		type: DataType.STRING(100)

	})
	declare  name: string

	@Unique(true)
	@AllowNull(false)
	@Column({
		type: DataType.STRING(50)
	})
	declare email : string

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

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true
	})
	declare is_active: boolean

	@HasMany( ( ) => Appointment  , {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE'
	})
	declare appointments: Appointment []
}

export default User