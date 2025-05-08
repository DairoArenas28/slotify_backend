import {Table, Column, Model, DataType, BelongsTo, Default, Unique, AllowNull} from 'sequelize-typescript'
import Appointment from './Appointment'

@Table({
    tableName: 'services'
  })
  class Service extends Model {
    @AllowNull(false)
    @Column({
      type: DataType.STRING(100)
    })
    declare name: string;
  
    @AllowNull(false)
    @Column({
      type: DataType.STRING(100)
    })
    declare description: string;
  
    @AllowNull(false)
    @Column({
      type: DataType.INTEGER // corregido: antes decía NUMBER, que no es válido
    })
    declare duration_minutes: number;
  
    @AllowNull(false)
    @Column({
      type: DataType.DECIMAL(12, 2),
    })
    declare price: number;
  
    @Column({
      type: DataType.BOOLEAN,
      defaultValue: true,
    })
    declare is_active: boolean;
  }
  
  export default Service;