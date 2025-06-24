import { Table, Column, Model, DataType, ForeignKey, BelongsTo, AllowNull } from 'sequelize-typescript';
import Budget from './Budget';


@Table({
	tableName: 'expenses',		

})
class Expense extends Model {
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

	@ForeignKey(() => Budget)
	declare budgetId: number;

	@BelongsTo(() => Budget, 
	{
		foreignKey: 'budgetId',
	})
	declare budget: Budget;
}

export default Expense;