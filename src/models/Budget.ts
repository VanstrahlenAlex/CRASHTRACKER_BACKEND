import { Table, Column, DataType, HasMany, BelongsTo, ForeignKey, Model, AllowNull } from 'sequelize-typescript'
import Expense from './Expense';

@Table({
	tableName: 'budgets',
})

class Budget extends Model {
	@AllowNull(false)
	@Column({
		type: DataType.STRING(100),
		allowNull: false,
	})
	declare name: string;

	@AllowNull(false)
	@Column({
		type: DataType.DECIMAL,
		allowNull: false,
	})
	declare amount: number;

	@HasMany( () => Expense,
		{
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		})
	declare expenses: Expense[];
}

export default Budget;
