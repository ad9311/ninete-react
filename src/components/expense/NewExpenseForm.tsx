function NewExpenseForm() {
	return (
		<form>
			<div>
				<label htmlFor="categoryId">Category</label>
				<input id="categoryId" name="categoryId" type="text" />
			</div>

			<div>
				<label htmlFor="description">Description</label>
				<input id="description" name="description" type="text" />
			</div>

			<div>
				<label htmlFor="amount">Amount</label>
				<input id="amount" name="amount" type="number" step="0.01" />
			</div>

			<div>
				<label htmlFor="date">Date</label>
				<input id="date" name="date" type="date" />
			</div>

			<button type="submit">Save expense</button>
		</form>
	);
}

export default NewExpenseForm;
