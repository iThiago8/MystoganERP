import { useEffect, useState } from "react";
import api from "../services/api";

export default function Transactions() {

    const [transactions, setTransactions] = useState([]);

    const [description, setDescription] = useState("");
    const [transactionType, setTransactionType] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [transactionDate, setTransactionDate] = useState("");

    const categories = [
        { label: "Vendas", value: "SALES" },
        { label: "Compras", value: "PURCHASES" },
        { label: "Salários", value: "PAYROLL" },
        { label: "Impostos", value: "TAXES" },
        { label: "Marketing", value: "MARKETING" },
        { label: "Tecnologia", value: "TECHNOLOGY" },
        { label: "Transporte", value: "TRANSPORT" },
        { label: "Alimentação", value: "FOOD" },
        { label: "Escritório", value: "OFFICE" },
        { label: "Outros", value: "OTHER" }
    ];

    const getCategoryLabel = (value) => {
        const category = categories.find(
            (cat) => cat.value === value
        );

        return category ? category.label : value;

    };

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = () => {
        api.get("/transactions")
            .then(response => {
                setTransactions(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    };

    const createTransaction = async (e) => {
        e.preventDefault();

        try {
            const response = await api.post("/transactions", {
                description,
                transaction_type: transactionType,
                amount: parseFloat(amount),
                category,
                transaction_date: transactionDate
            });

            setTransactions([...transactions, response.data]);

            setDescription("");
            setTransactionType("");
            setAmount("");
            setCategory("");
            setTransactionDate("");

        } catch (error) {
            console.error(error);
        }

    };

    return (

        <div>

            <h1>Transações</h1>

            <h2>Nova Transação</h2>

            <form onSubmit={createTransaction}>

                <div>
                    <label>Descrição</label>
                    <br />
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <br />

                <div>
                    <label>Categoria</label>
                    <br />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Selecione uma categoria</option>

                        {categories.map((cat) => (
                            <option
                                key={cat.value}
                                value={cat.value}
                            >
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label>Valor</label>
                    <br />
                    <input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>

                <br />

                <div>
                    <label>Data</label>
                    <br />
                    <input
                        type="date"
                        value={transactionDate}
                        onChange={(e) => setTransactionDate(e.target.value)}
                    />
                </div>

                <br />

                <div>
                    <label>Tipo</label>
                    <br />
                    <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                    >
                        <option value="">Selecione</option>
                        <option value="INCOME">Receita</option>
                        <option value="EXPENSE">Despesa</option>
                    </select>
                </div>

                <br />

                <button type="submit">
                    Salvar Transação
                </button>

            </form>

            <hr />

            <h2>Lista de Transações</h2>

            {
                transactions.map(transaction => (
                    <div key={transaction.id}>

                        <p>
                            <strong>ID:</strong> {transaction.id}
                        </p>

                        <p>
                            <strong>Descrição:</strong> {transaction.description}
                        </p>

                        <p>
                            <strong>Categoria:</strong>{" "}
                            {getCategoryLabel(transaction.category)}
                        </p>

                        <p>
                            <strong>Tipo:</strong> {transaction.transaction_type}
                        </p>

                        <p>
                            <strong>Valor:</strong> R$ {transaction.amount}
                        </p>

                        <p>
                            <strong>Data:</strong> {transaction.transaction_date}
                        </p>

                        <hr />

                    </div>
                ))
            }

        </div >

    );
}