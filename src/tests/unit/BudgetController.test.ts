import { BudgetController } from "../../controllers/BudgetController";
import Budget from "../../models/Budget";
import { budgets } from "../mocks/budgets";
import { createRequest, createResponse } from "node-mocks-http";


jest.mock("../../models/Budget", () => ({
	__esModule: true, // 👈 necesario para que funcione correctamente con import default
	default: {
		findAll: jest.fn(),
		create: jest.fn(),
	}
}))
describe("BudgetController", ()=> {

	beforeEach(() => {
		(Budget.findAll as jest.Mock).mockReset()
		(Budget.findAll as jest.Mock).mockImplementation((options) => {
			const updatedBudgets = budgets.filter(budget => budget.userId === options.where.userId);
			return Promise.resolve(updatedBudgets);
		})
	});

	it("should retrieve 3 budgets", async () => {
		
		const req = createRequest({
			method: "GET",
			url: "/api/budgets",
			user: { id: 1 }
		});
		const res = createResponse();

		await BudgetController.getAll(req, res);

		const data = res._getJSONData();
		console.log(data);

		expect(data).toHaveLength(2);
		expect(res.statusCode).toBe(200);
		expect(res.status).not.toBe(404);
	})

	it("should retrieve 1 budget for user with ID 2", async () => {

		const req = createRequest({
			method: "GET",
			url: "/api/budgets",
			user: { id: 2 }
		});
		const res = createResponse();

		await BudgetController.getAll(req, res);

		const data = res._getJSONData();
		console.log(data);

		expect(data).toHaveLength(1);
		expect(res.statusCode).toBe(200);
		expect(res.status).not.toBe(404);
	})

	it("should handle errors when fetching budgets", async() => {
		const req = createRequest({
			method: "GET",
			url: "/api/budgets",
			user: { id: 2 }
		});
		const res = createResponse();
		(Budget.findAll as jest.Mock).mockRejectedValue(new Error("Database error"));
		await BudgetController.getAll(req, res);

		expect(res.statusCode).toBe(500);
		expect(res._getJSONData()).toEqual({
			error: "Error fetching budgets"
		});
	})
})


describe("BudgetController.create", () => {
	it("Should create a new Budget and respond whit status code 201", async () => {
		const mockBudget = {
			save: jest.fn().mockResolvedValue(true),
		};
		(Budget.create as jest.Mock).mockResolvedValue(mockBudget);
		const req = createRequest({
			method: "POST",
			url: "/api/budgets",
			user: { id: 1 },
			body: {
				name: "Test Budget",
				amount: 1000,
				
			}
		});
		const res = createResponse();
		await BudgetController.create(req, res);
		const data = res._getJSONData();
		expect(res.statusCode).toBe(201);
		expect(data).toBe("Budget created successfully");
		expect(mockBudget.save).toHaveBeenCalled();
		expect(mockBudget.save).toHaveBeenCalledTimes(1);
		expect(Budget.create).toHaveBeenCalledWith(req.body);


		console.log(data);
	})

	it("Should handle budget creation error", async () => {
		const mockBudget = {
			save: jest.fn(),
		};
		(Budget.create as jest.Mock).mockImplementation(() => {
			throw new Error("Database error");
		});
		const req = createRequest({
			method: "POST",
			url: "/api/budgets",
			user: { id: 1 },
			body: {
				name: "Test Budget",
				amount: 1000,

			}
		});
		const res = createResponse();
		await BudgetController.create(req, res);
		const data = res._getJSONData();
		
		expect(res.statusCode).toBe(500);
		expect(data).toEqual({ error: "Internal server error" });


		expect(mockBudget.save).not.toHaveBeenCalled();
		expect(Budget.create).toHaveBeenCalledWith(req.body);

		console.log(data);
	})
})