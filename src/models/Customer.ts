import dayjs from "dayjs";
import { AllowNull, Column, DataType, Model, Table } from "sequelize-typescript";


@Table({
    tableName: 'customers'
})

class Customer extends Model {

    @Column({
        type: DataType.STRING(50)
    })
    declare first_name: string

    @Column({
        type: DataType.STRING(50)
    })
    declare last_name: string

    @Column({
        type: DataType.STRING(150)
    })
    declare email: string

    @Column({
        type: DataType.STRING(150)
    })
    declare phone: string

    @Column({
        type: DataType.INTEGER()
    })
    declare document_type: number

    @Column({
        type: DataType.STRING(),
        allowNull: false,
        unique: true,
    })
    declare document_number: string

    @Column({
        type: DataType.STRING()
    })
    declare address: string

    @Column({
        type: DataType.STRING()
    })
    declare country: string

    @AllowNull(true)
    @Column({
        type: DataType.DATEONLY
    })
    declare birth_date: Date

}

export default Customer