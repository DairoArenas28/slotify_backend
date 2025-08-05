import {Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, Default, Unique, AllowNull} from 'sequelize-typescript'
import Service from './Services'
import User from './User'
import Customer from './Customer';

@Table({
    tableName: 'appointments'
  })
  class Appointment extends Model {
    @AllowNull(false)
    @Column({
      type: DataType.DATEONLY
    })
    declare date: Date;
  
    @AllowNull(false)
    @Column({
      type: DataType.TIME
    })
    declare start_time: string;
  
    @AllowNull(false)
    @Column({
      type: DataType.TIME
    })
    declare end_time: string;
  
    @AllowNull(false)
    @Column({
      type: DataType.ENUM('disponible', 'reservado', 'cancelado', 'completado'),
      defaultValue: 'disponible'
    })
    declare status: 'disponible' | 'reservado' | 'cancelado' | 'completado';
  
    // Clave foránea hacia el usuario
    @ForeignKey(() => User)
    @Column
    declare userId: number;
  
    @BelongsTo(() => User)
    declare user: User;
  
    // Clave foránea hacia el servicio
    @ForeignKey(() => Service)
    @Column
    declare serviceId: number;

    // Clave foránea hacia el servicio
    @ForeignKey(() => Customer)
    @AllowNull(true)
    @Column
    declare customerId: number;
  
    @BelongsTo(() => Service)
    declare service: Service;

    @BelongsTo(() => Customer)
    declare customer: Customer;
  }
  
  export default Appointment;