import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '../components/ThemedText';
import { ThemedView } from '../components/ThemedView';
import { EnhancedButton } from '../components/EnhancedButton';
import { EnhancedCard } from '../components/EnhancedCard';
import { EnhancedInput } from '../components/EnhancedInput';

export interface FinancialTransaction {
    id: string;
    type: TransactionType;
    category: string;
    amount: number;
    description: string;
    date: Date;
    recurring?: boolean;
    frequency?: 'weekly' | 'monthly' | 'yearly';
    tags: string[];
}

export interface Budget {
    id: string;
    category: string;
    allocatedAmount: number;
    spentAmount: number;
    period: 'weekly' | 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
}

export interface FinancialGoal {
    id: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    category: 'savings' | 'debt_payoff' | 'investment' | 'emergency_fund' | 'other';
    priority: 'low' | 'medium' | 'high';
}

export interface FinancialAdvice {
    id: string;
    category: 'budgeting' | 'saving' | 'investing' | 'debt' | 'general';
    title: string;
    advice: string;
    priority: 'low' | 'medium' | 'high';
    applicable: boolean;
    dateGenerated: Date;
}

export type TransactionType = 'income' | 'expense' | 'transfer' | 'investment';

interface FinancialAdvisorProps {
    onAdviceGenerated?: (advice: FinancialAdvice[]) => void;
    onGoalProgress?: (goal: FinancialGoal) => void;
}

export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({
    onAdviceGenerated,
    onGoalProgress
}) => {
    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [goals, setGoals] = useState<FinancialGoal[]>([]);
    const [advice, setAdvice] = useState<FinancialAdvice[]>([]);
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [showGoalForm, setShowGoalForm] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        loadFinancialData();
    }, []);

    useEffect(() => {
        if (transactions.length > 0 || budgets.length > 0 || goals.length > 0) {
            generateFinancialAdvice();
        }
    }, [transactions, budgets, goals]);

    const loadFinancialData = async () => {
        try {
            const [storedTransactions, storedBudgets, storedGoals] = await Promise.all([
                AsyncStorage.getItem('financial_transactions'),
                AsyncStorage.getItem('financial_budgets'),
                AsyncStorage.getItem('financial_goals')
            ]);

            if (storedTransactions) {
                const parsedTransactions = JSON.parse(storedTransactions).map((t: any) => ({
                    ...t,
                    date: new Date(t.date)
                }));
                setTransactions(parsedTransactions);
            }

            if (storedBudgets) {
                const parsedBudgets = JSON.parse(storedBudgets).map((b: any) => ({
                    ...b,
                    startDate: new Date(b.startDate),
                    endDate: new Date(b.endDate)
                }));
                setBudgets(parsedBudgets);
            }

            if (storedGoals) {
                const parsedGoals = JSON.parse(storedGoals).map((g: any) => ({
                    ...g,
                    targetDate: new Date(g.targetDate)
                }));
                setGoals(parsedGoals);
            }
        } catch (error) {
            console.error('Error loading financial data:', error);
        }
    };

    const saveFinancialData = async () => {
        try {
            await Promise.all([
                AsyncStorage.setItem('financial_transactions', JSON.stringify(transactions)),
                AsyncStorage.setItem('financial_budgets', JSON.stringify(budgets)),
                AsyncStorage.setItem('financial_goals', JSON.stringify(goals))
            ]);
        } catch (error) {
            console.error('Error saving financial data:', error);
        }
    };

    const addTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
        const newTransaction: FinancialTransaction = {
            ...transaction,
            id: Date.now().toString()
        };

        const updatedTransactions = [...transactions, newTransaction];
        setTransactions(updatedTransactions);
        saveFinancialData();
        setShowTransactionForm(false);
    };

    const addBudget = (budget: Omit<Budget, 'id' | 'spentAmount'>) => {
        const newBudget: Budget = {
            ...budget,
            id: Date.now().toString(),
            spentAmount: 0
        };

        const updatedBudgets = [...budgets, newBudget];
        setBudgets(updatedBudgets);
        saveFinancialData();
        setShowBudgetForm(false);
    };

    const addGoal = (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => {
        const newGoal: FinancialGoal = {
            ...goal,
            id: Date.now().toString(),
            currentAmount: 0
        };

        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);
        saveFinancialData();
        setShowGoalForm(false);
    };

    const generateFinancialAdvice = () => {
        const newAdvice: FinancialAdvice[] = [];

        // Analyze spending patterns
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        // Savings advice
        if (savingsRate < 20) {
            newAdvice.push({
                id: 'savings_rate',
                category: 'saving',
                title: 'Improve Your Savings Rate',
                advice: `Your current savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% of your income. Consider automating transfers to savings accounts.`,
                priority: 'high',
                applicable: true,
                dateGenerated: new Date()
            });
        }

        // Budget analysis
        budgets.forEach(budget => {
            const budgetUsage = (budget.spentAmount / budget.allocatedAmount) * 100;
            if (budgetUsage > 90) {
                newAdvice.push({
                    id: `budget_${budget.id}`,
                    category: 'budgeting',
                    title: `Budget Alert: ${budget.category}`,
                    advice: `You've used ${budgetUsage.toFixed(1)}% of your ${budget.category} budget. Consider reducing spending in this category.`,
                    priority: 'high',
                    applicable: true,
                    dateGenerated: new Date()
                });
            }
        });

        // Goal progress advice
        goals.forEach(goal => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysRemaining = Math.ceil((goal.targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

            if (daysRemaining < 30 && progress < 75) {
                newAdvice.push({
                    id: `goal_${goal.id}`,
                    category: 'saving',
                    title: `Goal Progress: ${goal.title}`,
                    advice: `You're ${progress.toFixed(1)}% toward your goal with ${daysRemaining} days remaining. Consider increasing your contributions.`,
                    priority: 'medium',
                    applicable: true,
                    dateGenerated: new Date()
                });
            }
        });

        // Emergency fund advice
        const emergencyFundGoal = goals.find(g => g.category === 'emergency_fund');
        if (!emergencyFundGoal) {
            newAdvice.push({
                id: 'emergency_fund',
                category: 'saving',
                title: 'Build an Emergency Fund',
                advice: 'Consider creating an emergency fund with 3-6 months of expenses. This provides financial security during unexpected events.',
                priority: 'medium',
                applicable: true,
                dateGenerated: new Date()
            });
        }

        // Debt reduction advice
        const debtGoals = goals.filter(g => g.category === 'debt_payoff');
        if (debtGoals.length > 0) {
            newAdvice.push({
                id: 'debt_strategy',
                category: 'debt',
                title: 'Debt Reduction Strategy',
                advice: 'Focus on high-interest debt first (debt avalanche) or smallest balances first (debt snowball) for psychological wins.',
                priority: 'medium',
                applicable: true,
                dateGenerated: new Date()
            });
        }

        setAdvice(newAdvice);
        onAdviceGenerated?.(newAdvice);
    };

    const getFinancialSummary = () => {
        const now = new Date();
        const periodStart = new Date();

        switch (selectedPeriod) {
            case 'week':
                periodStart.setDate(now.getDate() - 7);
                break;
            case 'month':
                periodStart.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                periodStart.setFullYear(now.getFullYear() - 1);
                break;
        }

        const periodTransactions = transactions.filter(t => t.date >= periodStart);

        const income = periodTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = periodTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const netIncome = income - expenses;

        return { income, expenses, netIncome };
    };

    const summary = getFinancialSummary();

    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <ThemedText style={styles.title}>Financial Advisor</ThemedText>

                {/* Financial Summary */}
                <EnhancedCard style={styles.summaryCard}>
                    <ThemedText style={styles.sectionTitle}>Financial Summary</ThemedText>

                    <View style={styles.periodSelector}>
                        {(['week', 'month', 'year'] as const).map(period => (
                            <EnhancedButton
                                key={period}
                                label={period.charAt(0).toUpperCase() + period.slice(1)}
                                onPress={() => setSelectedPeriod(period)}
                                style={[
                                    styles.periodButton,
                                    selectedPeriod === period && styles.selectedPeriodButton
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.summaryStats}>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Income</ThemedText>
                            <ThemedText style={[styles.statValue, styles.incomeValue]}>
                                ${summary.income.toFixed(2)}
                            </ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Expenses</ThemedText>
                            <ThemedText style={[styles.statValue, styles.expenseValue]}>
                                ${summary.expenses.toFixed(2)}
                            </ThemedText>
                        </View>
                        <View style={styles.statItem}>
                            <ThemedText style={styles.statLabel}>Net Income</ThemedText>
                            <ThemedText style={[
                                styles.statValue,
                                summary.netIncome >= 0 ? styles.positiveValue : styles.negativeValue
                            ]}>
                                ${summary.netIncome.toFixed(2)}
                            </ThemedText>
                        </View>
                    </View>
                </EnhancedCard>

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    <EnhancedButton
                        label="Add Transaction"
                        onPress={() => setShowTransactionForm(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Create Budget"
                        onPress={() => setShowBudgetForm(true)}
                        style={styles.actionButton}
                    />
                    <EnhancedButton
                        label="Set Goal"
                        onPress={() => setShowGoalForm(true)}
                        style={styles.actionButton}
                    />
                </View>

                {/* Financial Advice */}
                {advice.length > 0 && (
                    <View style={styles.adviceSection}>
                        <ThemedText style={styles.sectionTitle}>Personalized Advice</ThemedText>
                        {advice.map(item => (
                            <EnhancedCard key={item.id} style={styles.adviceCard}>
                                <View style={styles.adviceHeader}>
                                    <ThemedText style={styles.adviceTitle}>{item.title}</ThemedText>
                                    <ThemedText style={[
                                        styles.advicePriority,
                                        item.priority === 'high' && styles.highPriority,
                                        item.priority === 'medium' && styles.mediumPriority,
                                        item.priority === 'low' && styles.lowPriority
                                    ]}>
                                        {item.priority}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.adviceText}>{item.advice}</ThemedText>
                                <ThemedText style={styles.adviceCategory}>{item.category}</ThemedText>
                            </EnhancedCard>
                        ))}
                    </View>
                )}

                {/* Goals Overview */}
                {goals.length > 0 && (
                    <View style={styles.goalsSection}>
                        <ThemedText style={styles.sectionTitle}>Financial Goals</ThemedText>
                        {goals.map(goal => {
                            const progress = (goal.currentAmount / goal.targetAmount) * 100;
                            return (
                                <EnhancedCard key={goal.id} style={styles.goalCard}>
                                    <View style={styles.goalHeader}>
                                        <ThemedText style={styles.goalTitle}>{goal.title}</ThemedText>
                                        <ThemedText style={styles.goalProgress}>
                                            ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${Math.min(progress, 100)}%` }
                                            ]}
                                        />
                                    </View>
                                    <ThemedText style={styles.progressText}>
                                        {progress.toFixed(1)}% complete
                                    </ThemedText>
                                </EnhancedCard>
                            );
                        })}
                    </View>
                )}

                {/* Transaction Form Modal */}
                {showTransactionForm && (
                    <TransactionForm
                        onSubmit={addTransaction}
                        onCancel={() => setShowTransactionForm(false)}
                    />
                )}

                {/* Budget Form Modal */}
                {showBudgetForm && (
                    <BudgetForm
                        onSubmit={addBudget}
                        onCancel={() => setShowBudgetForm(false)}
                    />
                )}

                {/* Goal Form Modal */}
                {showGoalForm && (
                    <GoalForm
                        onSubmit={addGoal}
                        onCancel={() => setShowGoalForm(false)}
                    />
                )}
            </ScrollView>
        </ThemedView>
    );
};

// Form Components
const TransactionForm: React.FC<{
    onSubmit: (transaction: Omit<FinancialTransaction, 'id'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = () => {
        if (!category || !amount || !description) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        onSubmit({
            type,
            category,
            amount: parseFloat(amount),
            description,
            date: new Date(),
            tags: []
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Add Transaction</ThemedText>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Type</ThemedText>
                <View style={styles.typeSelector}>
                    {(['income', 'expense', 'transfer', 'investment'] as TransactionType[]).map(t => (
                        <EnhancedButton
                            key={t}
                            label={t}
                            onPress={() => setType(t)}
                            style={[
                                styles.typeButton,
                                type === t && styles.selectedTypeButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <EnhancedInput
                placeholder="Category (e.g., Food, Salary, Rent)"
                value={category}
                onChangeText={setCategory}
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                style={styles.inputField}
            />

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Add" onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
    );
};

const BudgetForm: React.FC<{
    onSubmit: (budget: Omit<Budget, 'id' | 'spentAmount'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

    const handleSubmit = () => {
        if (!category || !amount) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const now = new Date();
        const endDate = new Date(now);

        switch (period) {
            case 'weekly':
                endDate.setDate(now.getDate() + 7);
                break;
            case 'monthly':
                endDate.setMonth(now.getMonth() + 1);
                break;
            case 'yearly':
                endDate.setFullYear(now.getFullYear() + 1);
                break;
        }

        onSubmit({
            category,
            allocatedAmount: parseFloat(amount),
            period,
            startDate: now,
            endDate
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Create Budget</ThemedText>

            <EnhancedInput
                placeholder="Category (e.g., Food, Entertainment)"
                value={category}
                onChangeText={setCategory}
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Budget Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={styles.inputField}
            />

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Period</ThemedText>
                <View style={styles.periodSelector}>
                    {(['weekly', 'monthly', 'yearly'] as const).map(p => (
                        <EnhancedButton
                            key={p}
                            label={p}
                            onPress={() => setPeriod(p)}
                            style={[
                                styles.periodButton,
                                period === p && styles.selectedPeriodButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Create" onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
    );
};

const GoalForm: React.FC<{
    onSubmit: (goal: Omit<FinancialGoal, 'id' | 'currentAmount'>) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const [title, setTitle] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [targetDate, setTargetDate] = useState('');
    const [category, setCategory] = useState<FinancialGoal['category']>('savings');
    const [priority, setPriority] = useState<FinancialGoal['priority']>('medium');

    const handleSubmit = () => {
        if (!title || !targetAmount || !targetDate) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        onSubmit({
            title,
            targetAmount: parseFloat(targetAmount),
            targetDate: new Date(targetDate),
            category,
            priority
        });
    };

    return (
        <EnhancedCard style={styles.formModal}>
            <ThemedText style={styles.formTitle}>Set Financial Goal</ThemedText>

            <EnhancedInput
                placeholder="Goal Title"
                value={title}
                onChangeText={setTitle}
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Target Amount"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
                style={styles.inputField}
            />

            <EnhancedInput
                placeholder="Target Date (YYYY-MM-DD)"
                value={targetDate}
                onChangeText={setTargetDate}
                style={styles.inputField}
            />

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Category</ThemedText>
                <View style={styles.categorySelector}>
                    {(['savings', 'debt_payoff', 'investment', 'emergency_fund', 'other'] as const).map(cat => (
                        <EnhancedButton
                            key={cat}
                            label={cat.replace('_', ' ')}
                            onPress={() => setCategory(cat)}
                            style={[
                                styles.categoryButton,
                                category === cat && styles.selectedCategoryButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.formField}>
                <ThemedText style={styles.fieldLabel}>Priority</ThemedText>
                <View style={styles.prioritySelector}>
                    {(['low', 'medium', 'high'] as const).map(p => (
                        <EnhancedButton
                            key={p}
                            label={p}
                            onPress={() => setPriority(p)}
                            style={[
                                styles.priorityButton,
                                priority === p && styles.selectedPriorityButton
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.formActions}>
                <EnhancedButton label="Cancel" onPress={onCancel} style={styles.cancelButton} />
                <EnhancedButton label="Create" onPress={handleSubmit} style={styles.submitButton} />
            </View>
        </EnhancedCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    scrollView: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    summaryCard: {
        marginBottom: 16,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    periodSelector: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    periodButton: {
        flex: 1,
        marginRight: 8,
    },
    selectedPeriodButton: {
        backgroundColor: '#007AFF',
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    incomeValue: {
        color: '#28A745',
    },
    expenseValue: {
        color: '#DC3545',
    },
    positiveValue: {
        color: '#28A745',
    },
    negativeValue: {
        color: '#DC3545',
    },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 5,
    },
    adviceSection: {
        marginBottom: 20,
    },
    adviceCard: {
        marginBottom: 12,
        padding: 16,
    },
    adviceHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    adviceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    advicePriority: {
        fontSize: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        textAlign: 'center',
    },
    highPriority: {
        backgroundColor: '#FFE6E6',
        color: '#DC3545',
    },
    mediumPriority: {
        backgroundColor: '#FFF3CD',
        color: '#856404',
    },
    lowPriority: {
        backgroundColor: '#D1ECF1',
        color: '#0C5460',
    },
    adviceText: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    adviceCategory: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    goalsSection: {
        marginBottom: 20,
    },
    goalCard: {
        marginBottom: 12,
        padding: 16,
    },
    goalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    goalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    goalProgress: {
        fontSize: 14,
        color: '#666',
    },
    progressBar: {
        height: 8,
        backgroundColor: '#E9ECEF',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#007AFF',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },
    formModal: {
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        maxHeight: 500,
        zIndex: 1000,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    formField: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    typeSelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    typeButton: {
        marginRight: 8,
        marginBottom: 8,
        minWidth: 80,
    },
    selectedTypeButton: {
        backgroundColor: '#007AFF',
    },
    inputField: {
        marginBottom: 12,
    },
    formActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    cancelButton: {
        flex: 1,
        marginRight: 8,
    },
    submitButton: {
        flex: 1,
        marginLeft: 8,
    },
    budgetPeriodSelector: {
        flexDirection: 'row',
    },
    categorySelector: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    categoryButton: {
        marginRight: 8,
        marginBottom: 8,
        minWidth: 100,
    },
    selectedCategoryButton: {
        backgroundColor: '#007AFF',
    },
    prioritySelector: {
        flexDirection: 'row',
    },
    priorityButton: {
        flex: 1,
        marginRight: 8,
    },
    selectedPriorityButton: {
        backgroundColor: '#007AFF',
    },
});

export default FinancialAdvisor;
