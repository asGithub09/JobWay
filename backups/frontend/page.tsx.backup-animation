"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  CirclePlus,
  Clock3,
  Edit3,
  FileQuestion,
  Layers3,
  Loader2,
  MoreVertical,
  RefreshCw,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

import {
  createExam,
  createMockTest,
  createMockTestQuestion,
  createTestSeries,
  deleteExam,
  deleteMockTest,
  deleteMockTestQuestion,
  deleteTestSeries,
  getAdminExams,
  getAdminMockTests,
  getAdminMockTestQuestions,
  getAdminTestSeries,
  updateExam,
  updateMockTest,
  updateMockTestQuestion,
  updateTestSeries,
  type CreateMockTestPayload,
  type Exam,
  type MockTest,
  type MockTestQuestion,
  type TestSeries,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const categories = [
  "Banking",
  "SSC",
  "UPSC",
  "Railway",
  "State PSC",
  "Teaching",
  "Defence",
  "Engineering",
  "Medical",
  "Other",
];

type StatusFilter = "ALL" | "PUBLISHED" | "DRAFT";

type ExamFormState = {
  name: string;
  shortName: string;
  category: string;
  description: string;
  sortOrder: string;
  isPublished: boolean;
};

type SeriesFormState = {
  exam: string;
  title: string;
  description: string;
  accessType: "FREE" | "PREMIUM";
  price: string;
  discountPrice: string;
  sortOrder: string;
  isPublished: boolean;
};

type QuestionFormState = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  subject: string;
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  order: string;
};

const emptyQuestionForm: QuestionFormState = {
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctAnswer: "A",
  explanation: "",
  subject: "",
  topic: "",
  difficulty: "EASY",
  order: "1",
};
type MockFormState = {
  testSeries: string;
  title: string;
  description: string;
  durationMinutes: string;
  marksPerQuestion: string;
  negativeMarking: string;
  accessType: "FREE" | "PREMIUM";
  attemptLimit: string;
  instructions: string;
  sortOrder: string;
  isPublished: boolean;
};

const emptyExamForm: ExamFormState = {
  name: "",
  shortName: "",
  category: "",
  description: "",
  sortOrder: "0",
  isPublished: false,
};

const emptySeriesForm: SeriesFormState = {
  exam: "",
  title: "",
  description: "",
  accessType: "FREE",
  price: "0",
  discountPrice: "0",
  sortOrder: "0",
  isPublished: false,
};

const emptyMockForm: MockFormState = {
  testSeries: "",
  title: "",
  description: "",
  durationMinutes: "60",
  marksPerQuestion: "1",
  negativeMarking: "0",
  accessType: "FREE",
  attemptLimit: "0",
  instructions: "",
  sortOrder: "0",
  isPublished: false,
};

export default function AdminExamsPage() {
  const { token } = useAuth();

  const [exams, setExams] = useState<Exam[]>([]);
  const [testSeries, setTestSeries] = useState<TestSeries[]>([]);
  const [mockTests, setMockTests] = useState<MockTest[]>([]);

  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingSeries, setLoadingSeries] = useState(true);
  const [loadingMocks, setLoadingMocks] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [seriesSearch, setSeriesSearch] = useState("");
  const [seriesExamFilter, setSeriesExamFilter] = useState("ALL");
  const [seriesStatusFilter, setSeriesStatusFilter] =
    useState<StatusFilter>("ALL");

  const [mockSearch, setMockSearch] = useState("");
  const [mockSeriesFilter, setMockSeriesFilter] = useState("ALL");
  const [mockStatusFilter, setMockStatusFilter] =
    useState<StatusFilter>("ALL");

  const [questionModalOpen, setQuestionModalOpen] = useState(false);
const [questionFormOpen, setQuestionFormOpen] = useState(false);
const [selectedMockForQuestions, setSelectedMockForQuestions] =
  useState<MockTest | null>(null);
const [questions, setQuestions] = useState<MockTestQuestion[]>([]);
const [loadingQuestions, setLoadingQuestions] = useState(false);
const [editingQuestion, setEditingQuestion] =
  useState<MockTestQuestion | null>(null);
const [questionForm, setQuestionForm] =
  useState<QuestionFormState>(emptyQuestionForm);
const [savingQuestion, setSavingQuestion] = useState(false);
const [deletingQuestionId, setDeletingQuestionId] =
  useState<string | null>(null);
const [examModalOpen, setExamModalOpen] = useState(false);
  const [seriesModalOpen, setSeriesModalOpen] = useState(false);
  const [mockModalOpen, setMockModalOpen] = useState(false);

  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editingSeries, setEditingSeries] = useState<TestSeries | null>(null);
  const [editingMock, setEditingMock] = useState<MockTest | null>(null);

  const [examForm, setExamForm] = useState<ExamFormState>(emptyExamForm);
  const [seriesForm, setSeriesForm] =
    useState<SeriesFormState>(emptySeriesForm);
  const [mockForm, setMockForm] = useState<MockFormState>(emptyMockForm);

  const [savingExam, setSavingExam] = useState(false);
  const [savingSeries, setSavingSeries] = useState(false);
  const [savingMock, setSavingMock] = useState(false);

  const [deletingExamId, setDeletingExamId] = useState<string | null>(null);
  const [deletingSeriesId, setDeletingSeriesId] = useState<string | null>(
    null,
  );
  const [deletingMockId, setDeletingMockId] = useState<string | null>(null);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const loadExams = useCallback(async () => {
    if (!token) {
      setLoadingExams(false);
      return;
    }

    setLoadingExams(true);

    try {
      const response = await getAdminExams(token);
      setExams(response.exams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load exams.");
    } finally {
      setLoadingExams(false);
    }
  }, [token]);

  const loadTestSeries = useCallback(async () => {
    if (!token) {
      setLoadingSeries(false);
      return;
    }

    setLoadingSeries(true);

    try {
      const response = await getAdminTestSeries(token);
      setTestSeries(response.testSeries || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load test series.",
      );
    } finally {
      setLoadingSeries(false);
    }
  }, [token]);

  const loadMockTests = useCallback(async () => {
    if (!token) {
      setLoadingMocks(false);
      return;
    }

    setLoadingMocks(true);

    try {
      const response = await getAdminMockTests(token);
      setMockTests(response.mockTests || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load mock tests.",
      );
    } finally {
      setLoadingMocks(false);
    }
  }, [token]);

  const refreshAll = useCallback(() => {
    loadExams();
    loadTestSeries();
    loadMockTests();
  }, [loadExams, loadTestSeries, loadMockTests]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => setSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filteredExams = useMemo(() => {
    const value = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !value ||
        exam.name.toLowerCase().includes(value) ||
        exam.shortName?.toLowerCase().includes(value) ||
        exam.category.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && exam.isPublished) ||
        (statusFilter === "DRAFT" && !exam.isPublished);

      return matchesSearch && matchesStatus;
    });
  }, [exams, search, statusFilter]);

  const filteredSeries = useMemo(() => {
    const value = seriesSearch.trim().toLowerCase();

    return testSeries.filter((series) => {
      const examId =
        typeof series.exam === "string" ? series.exam : series.exam?._id;

      const matchesSearch =
        !value ||
        series.title.toLowerCase().includes(value) ||
        series.description?.toLowerCase().includes(value);

      const matchesExam =
        seriesExamFilter === "ALL" || examId === seriesExamFilter;

      const matchesStatus =
        seriesStatusFilter === "ALL" ||
        (seriesStatusFilter === "PUBLISHED" && series.isPublished) ||
        (seriesStatusFilter === "DRAFT" && !series.isPublished);

      return matchesSearch && matchesExam && matchesStatus;
    });
  }, [testSeries, seriesSearch, seriesExamFilter, seriesStatusFilter]);

  const filteredMocks = useMemo(() => {
    const value = mockSearch.trim().toLowerCase();

    return mockTests.filter((mock) => {
      const seriesId =
        typeof mock.testSeries === "string"
          ? mock.testSeries
          : mock.testSeries?._id;

      const matchesSearch =
        !value ||
        mock.title.toLowerCase().includes(value) ||
        mock.description?.toLowerCase().includes(value);

      const matchesSeries =
        mockSeriesFilter === "ALL" || seriesId === mockSeriesFilter;

      const matchesStatus =
        mockStatusFilter === "ALL" ||
        (mockStatusFilter === "PUBLISHED" && mock.isPublished) ||
        (mockStatusFilter === "DRAFT" && !mock.isPublished);

      return matchesSearch && matchesSeries && matchesStatus;
    });
  }, [mockTests, mockSearch, mockSeriesFilter, mockStatusFilter]);

  const examStats = useMemo(() => {
    const published = exams.filter((item) => item.isPublished).length;

    return {
      total: exams.length,
      published,
      drafts: exams.length - published,
      categoriesUsed: new Set(exams.map((item) => item.category)).size,
    };
  }, [exams]);

  const seriesStats = useMemo(() => {
    const published = testSeries.filter((item) => item.isPublished).length;
    const premium = testSeries.filter(
      (item) => item.accessType === "PREMIUM",
    ).length;

    return {
      total: testSeries.length,
      published,
      drafts: testSeries.length - published,
      premium,
    };
  }, [testSeries]);

  const mockStats = useMemo(() => {
    const published = mockTests.filter((item) => item.isPublished).length;
    const premium = mockTests.filter(
      (item) => item.accessType === "PREMIUM",
    ).length;
    const questions = mockTests.reduce(
      (total, item) => total + (item.totalQuestions || 0),
      0,
    );

    return {
      total: mockTests.length,
      published,
      drafts: mockTests.length - published,
      premium,
      questions,
    };
  }, [mockTests]);

  function getExamName(examValue: TestSeries["exam"]) {
    if (typeof examValue !== "string" && examValue?.name) {
      return examValue.name;
    }

    return exams.find((item) => item.id === examValue)?.name || "Unknown exam";
  }

  function getSeriesName(seriesValue: MockTest["testSeries"]) {
    if (typeof seriesValue !== "string" && seriesValue?.title) {
      return seriesValue.title;
    }

    return (
      testSeries.find((item) => item.id === seriesValue)?.title ||
      "Unknown series"
    );
  }

  function getSeriesExam(seriesValue: MockTest["testSeries"]) {
    const id =
      typeof seriesValue === "string" ? seriesValue : seriesValue?._id;

    const series = testSeries.find((item) => item.id === id);
    return series ? getExamName(series.exam) : "Unknown exam";
  }

  function openCreateExamModal() {
    setEditingExam(null);
    setExamForm(emptyExamForm);
    setError("");
    setExamModalOpen(true);
  }

  function openEditExamModal(exam: Exam) {
    setEditingExam(exam);
    setExamForm({
      name: exam.name,
      shortName: exam.shortName || "",
      category: exam.category,
      description: exam.description || "",
      sortOrder: String(exam.sortOrder ?? 0),
      isPublished: exam.isPublished,
    });
    setError("");
    setExamModalOpen(true);
  }

  function closeExamModal() {
    if (savingExam) return;
    setExamModalOpen(false);
    setEditingExam(null);
    setExamForm(emptyExamForm);
  }

  function updateExamField(
    field: keyof ExamFormState,
    value: string | boolean,
  ) {
    setExamForm((current) => ({ ...current, [field]: value }));
  }

  async function handleExamSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (!examForm.name.trim() || !examForm.category.trim()) {
      setError("Exam name and category are required.");
      return;
    }

    setSavingExam(true);
    setError("");

    try {
      const payload = {
        name: examForm.name.trim(),
        shortName: examForm.shortName.trim(),
        category: examForm.category.trim(),
        description: examForm.description.trim(),
        sortOrder: Number(examForm.sortOrder) || 0,
        isPublished: examForm.isPublished,
      };

      if (editingExam) {
        const response = await updateExam(token, editingExam.id, payload);
        setExams((current) =>
          current.map((item) =>
            item.id === editingExam.id ? response.exam : item,
          ),
        );
        setSuccess("Exam updated successfully.");
      } else {
        const response = await createExam(token, payload);
        setExams((current) => [response.exam, ...current]);
        setSuccess("Exam created successfully.");
      }

      closeExamModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save exam.");
    } finally {
      setSavingExam(false);
    }
  }

  async function handleToggleExamPublish(exam: Exam) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    try {
      setError("");
      const response = await updateExam(token, exam.id, {
        isPublished: !exam.isPublished,
      });

      setExams((current) =>
        current.map((item) =>
          item.id === exam.id ? response.exam : item,
        ),
      );

      setSuccess(
        response.exam.isPublished
          ? "Exam published successfully."
          : "Exam moved to draft.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update exam status.",
      );
    }
  }

  async function handleDeleteExam(exam: Exam) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (
      !window.confirm(
        `Delete "${exam.name}"?\n\nThis will only succeed if the exam has no test series.`,
      )
    ) {
      return;
    }

    setDeletingExamId(exam.id);
    setError("");

    try {
      await deleteExam(token, exam.id);
      setExams((current) => current.filter((item) => item.id !== exam.id));
      setSuccess("Exam deleted successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete exam.");
    } finally {
      setDeletingExamId(null);
    }
  }

  function openCreateSeriesModal(examId?: string) {
    setEditingSeries(null);
    setSeriesForm({
      ...emptySeriesForm,
      exam: examId || (exams.length ? exams[0].id : ""),
    });
    setError("");
    setSeriesModalOpen(true);
  }

  function openEditSeriesModal(series: TestSeries) {
    const examId =
      typeof series.exam === "string" ? series.exam : series.exam?._id;

    setEditingSeries(series);
    setSeriesForm({
      exam: examId || "",
      title: series.title,
      description: series.description || "",
      accessType: series.accessType,
      price: String(series.price ?? 0),
      discountPrice: String(series.discountPrice ?? 0),
      sortOrder: String(series.sortOrder ?? 0),
      isPublished: series.isPublished,
    });
    setError("");
    setSeriesModalOpen(true);
  }

  function closeSeriesModal() {
    if (savingSeries) return;
    setSeriesModalOpen(false);
    setEditingSeries(null);
    setSeriesForm(emptySeriesForm);
  }

  function updateSeriesField(
    field: keyof SeriesFormState,
    value: string | boolean,
  ) {
    setSeriesForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSeriesSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (!seriesForm.exam || !seriesForm.title.trim()) {
      setError("Parent exam and series title are required.");
      return;
    }

    const price = Math.max(0, Number(seriesForm.price) || 0);
    const discountPrice = Math.max(
      0,
      Number(seriesForm.discountPrice) || 0,
    );

    if (seriesForm.accessType === "FREE" && (price > 0 || discountPrice > 0)) {
      setError("Free test series should have zero pricing.");
      return;
    }

    if (
      seriesForm.accessType === "PREMIUM" &&
      discountPrice > 0 &&
      price > 0 &&
      discountPrice > price
    ) {
      setError("Discount price cannot be greater than the original price.");
      return;
    }

    setSavingSeries(true);
    setError("");

    try {
      const payload = {
        exam: seriesForm.exam,
        title: seriesForm.title.trim(),
        description: seriesForm.description.trim(),
        accessType: seriesForm.accessType,
        price,
        discountPrice,
        sortOrder: Number(seriesForm.sortOrder) || 0,
        isPublished: seriesForm.isPublished,
      };

      if (editingSeries) {
        const response = await updateTestSeries(
          token,
          editingSeries.id,
          payload,
        );

        setTestSeries((current) =>
          current.map((item) =>
            item.id === editingSeries.id ? response.testSeries : item,
          ),
        );

        setSuccess("Test series updated successfully.");
      } else {
        const response = await createTestSeries(token, payload);
        setTestSeries((current) => [response.testSeries, ...current]);
        setSuccess("Test series created successfully.");
      }

      closeSeriesModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save test series.",
      );
    } finally {
      setSavingSeries(false);
    }
  }

  async function handleToggleSeriesPublish(series: TestSeries) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    try {
      const response = await updateTestSeries(token, series.id, {
        isPublished: !series.isPublished,
      });

      setTestSeries((current) =>
        current.map((item) =>
          item.id === series.id ? response.testSeries : item,
        ),
      );

      setSuccess(
        response.testSeries.isPublished
          ? "Test series published successfully."
          : "Test series moved to draft.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update series status.",
      );
    }
  }

  async function handleDeleteSeries(series: TestSeries) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (
      !window.confirm(
        `Delete "${series.title}"?\n\nThis will only succeed if the series has no mock tests.`,
      )
    ) {
      return;
    }

    setDeletingSeriesId(series.id);
    setError("");

    try {
      await deleteTestSeries(token, series.id);
      setTestSeries((current) =>
        current.filter((item) => item.id !== series.id),
      );
      setSuccess("Test series deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete test series.",
      );
    } finally {
      setDeletingSeriesId(null);
    }
  }

  async function loadQuestions(mockTestId: string) {
    if (!token) return;

    setLoadingQuestions(true);
    setError("");

    try {
      const response = await getAdminMockTestQuestions(
        token,
        mockTestId,
      );

      setQuestions(response.questions || []);
    } catch (err) {
      setQuestions([]);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load questions.",
      );
    } finally {
      setLoadingQuestions(false);
    }
  }

  async function openQuestionBank(mock: MockTest) {
    setSelectedMockForQuestions(mock);
    setQuestions([]);
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setQuestionFormOpen(false);
    setQuestionModalOpen(true);
    setSuccess("");
    setError("");

    await loadQuestions(mock.id);
  }

  function closeQuestionForm() {
    if (savingQuestion) return;

    setQuestionFormOpen(false);
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setError("");
  }

  function closeQuestionBank() {
    if (savingQuestion || deletingQuestionId) return;

    setQuestionModalOpen(false);
    setQuestionFormOpen(false);
    setSelectedMockForQuestions(null);
    setQuestions([]);
    setEditingQuestion(null);
    setQuestionForm(emptyQuestionForm);
    setError("");
  }

  function openCreateQuestion() {
    setEditingQuestion(null);
    setQuestionForm({
      ...emptyQuestionForm,
      order: String(questions.length + 1),
    });
    setQuestionFormOpen(true);
    setError("");
  }

  function openEditQuestion(question: MockTestQuestion) {
    const optionMap: Record<"A" | "B" | "C" | "D", string> = {
      A: "",
      B: "",
      C: "",
      D: "",
    };

    question.options.forEach((option) => {
      if (
        option.key === "A" ||
        option.key === "B" ||
        option.key === "C" ||
        option.key === "D"
      ) {
        optionMap[option.key] = option.text;
      }
    });

    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText || "",
      optionA: optionMap.A,
      optionB: optionMap.B,
      optionC: optionMap.C,
      optionD: optionMap.D,
      correctAnswer:
        question.correctAnswer === "B"
          ? "B"
          : question.correctAnswer === "C"
            ? "C"
            : question.correctAnswer === "D"
              ? "D"
              : "A",
      explanation: question.explanation || "",
      subject: question.subject || "",
      topic: question.topic || "",
      difficulty: question.difficulty || "EASY",
      order: String(question.order || 1),
    });
    setQuestionFormOpen(true);
    setError("");
  }

  function updateQuestionField<K extends keyof QuestionFormState>(
    field: K,
    value: QuestionFormState[K],
  ) {
    setQuestionForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleQuestionSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !selectedMockForQuestions) return;

    const questionText = questionForm.questionText.trim();
    const optionA = questionForm.optionA.trim();
    const optionB = questionForm.optionB.trim();
    const optionC = questionForm.optionC.trim();
    const optionD = questionForm.optionD.trim();

    if (!questionText) {
      setError("Question text is required.");
      return;
    }

    if (!optionA || !optionB || !optionC || !optionD) {
      setError("All four options are required.");
      return;
    }

    const order = Number(questionForm.order);

    if (!Number.isInteger(order) || order < 1) {
      setError("Question order must be a positive whole number.");
      return;
    }

    setSavingQuestion(true);
    setError("");

    try {
      const options = [
        { key: "A", text: optionA },
        { key: "B", text: optionB },
        { key: "C", text: optionC },
        { key: "D", text: optionD },
      ];

      if (editingQuestion) {
        const response = await updateMockTestQuestion(
          token,
          editingQuestion.id,
          {
            questionText,
            options,
            correctAnswer: questionForm.correctAnswer,
            explanation: questionForm.explanation.trim(),
            subject: questionForm.subject.trim(),
            topic: questionForm.topic.trim(),
            difficulty: questionForm.difficulty,
            order,
          },
        );

        setQuestions((current) =>
          current
            .map((item) =>
              item.id === editingQuestion.id
                ? response.question
                : item,
            )
            .sort((a, b) => a.order - b.order),
        );

        setSuccess("Question updated successfully.");
      } else {
        const response = await createMockTestQuestion(token, {
          mockTest: selectedMockForQuestions.id,
          questionText,
          options,
          correctAnswer: questionForm.correctAnswer,
          explanation: questionForm.explanation.trim(),
          subject: questionForm.subject.trim(),
          topic: questionForm.topic.trim(),
          difficulty: questionForm.difficulty,
          order,
        });

        setQuestions((current) =>
          [...current, response.question].sort(
            (a, b) => a.order - b.order,
          ),
        );

        const updatedTotal =
          response.totalQuestions ?? questions.length + 1;

        setMockTests((current) =>
          current.map((mock) =>
            mock.id === selectedMockForQuestions.id
              ? {
                  ...mock,
                  totalQuestions: updatedTotal,
                }
              : mock,
          ),
        );

        setSelectedMockForQuestions((current) =>
          current
            ? {
                ...current,
                totalQuestions: updatedTotal,
              }
            : current,
        );

        setSuccess("Question created successfully.");
      }

      setQuestionFormOpen(false);
      setEditingQuestion(null);
      setQuestionForm(emptyQuestionForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save question.",
      );
    } finally {
      setSavingQuestion(false);
    }
  }

  async function handleDeleteQuestion(question: MockTestQuestion) {
    if (!token || !selectedMockForQuestions) return;

    const confirmed = window.confirm(
      `Delete question ${question.order}?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingQuestionId(question.id);
    setError("");

    try {
      const response = await deleteMockTestQuestion(
        token,
        question.id,
      );

      setQuestions((current) =>
        current.filter((item) => item.id !== question.id),
      );

      const updatedTotal =
        response.totalQuestions ??
        Math.max(0, questions.length - 1);

      setMockTests((current) =>
        current.map((mock) =>
          mock.id === selectedMockForQuestions.id
            ? {
                ...mock,
                totalQuestions: updatedTotal,
              }
            : mock,
        ),
      );

      setSelectedMockForQuestions((current) =>
        current
          ? {
              ...current,
              totalQuestions: updatedTotal,
            }
          : current,
      );

      if (editingQuestion?.id === question.id) {
        setEditingQuestion(null);
        setQuestionFormOpen(false);
        setQuestionForm(emptyQuestionForm);
      }

      setSuccess("Question deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete question.",
      );
    } finally {
      setDeletingQuestionId(null);
    }
  }
  function openCreateMockModal(seriesId?: string) {
    setEditingMock(null);
    setMockForm({
      ...emptyMockForm,
      testSeries:
        seriesId ||
        (testSeries.length ? testSeries[0].id : ""),
    });
    setError("");
    setMockModalOpen(true);
  }

  function openEditMockModal(mock: MockTest) {
    const seriesId =
      typeof mock.testSeries === "string"
        ? mock.testSeries
        : mock.testSeries?._id;

    setEditingMock(mock);
    setMockForm({
      testSeries: seriesId || "",
      title: mock.title,
      description: mock.description || "",
      durationMinutes: String(mock.durationMinutes ?? 60),
      marksPerQuestion: String(mock.marksPerQuestion ?? 1),
      negativeMarking: String(mock.negativeMarking ?? 0),
      accessType: mock.accessType,
      attemptLimit: String(mock.attemptLimit ?? 0),
      instructions: (mock.instructions || []).join("\n"),
      sortOrder: String(mock.sortOrder ?? 0),
      isPublished: mock.isPublished,
    });
    setError("");
    setMockModalOpen(true);
  }

  function closeMockModal() {
    if (savingMock) return;
    setMockModalOpen(false);
    setEditingMock(null);
    setMockForm(emptyMockForm);
  }

  function updateMockField(
    field: keyof MockFormState,
    value: string | boolean,
  ) {
    setMockForm((current) => ({ ...current, [field]: value }));
  }

  async function handleMockSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (!mockForm.testSeries || !mockForm.title.trim()) {
      setError("Parent test series and mock test title are required.");
      return;
    }

    const durationMinutes = Math.max(
      1,
      Number(mockForm.durationMinutes) || 0,
    );
    const marksPerQuestion = Math.max(
      0,
      Number(mockForm.marksPerQuestion) || 0,
    );
    const negativeMarking = Math.max(
      0,
      Number(mockForm.negativeMarking) || 0,
    );
    const attemptLimit = Math.max(0, Number(mockForm.attemptLimit) || 0);

    if (durationMinutes < 1) {
      setError("Duration must be at least 1 minute.");
      return;
    }

    if (negativeMarking > marksPerQuestion && marksPerQuestion > 0) {
      setError(
        "Negative marking should not be greater than marks per question.",
      );
      return;
    }

    const instructions = mockForm.instructions
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    setSavingMock(true);
    setError("");

    try {
      const payload: CreateMockTestPayload = {
        testSeries: mockForm.testSeries,
        title: mockForm.title.trim(),
        description: mockForm.description.trim(),
        durationMinutes,
        marksPerQuestion,
        negativeMarking,
        accessType: mockForm.accessType,
        instructions,
        attemptLimit,
        sortOrder: Number(mockForm.sortOrder) || 0,
        isPublished: mockForm.isPublished,
      };

      if (editingMock) {
        const response = await updateMockTest(
          token,
          editingMock.id,
          payload,
        );

        setMockTests((current) =>
          current.map((item) =>
            item.id === editingMock.id ? response.mockTest : item,
          ),
        );

        setSuccess("Mock test updated successfully.");
      } else {
        const response = await createMockTest(token, payload);
        setMockTests((current) => [response.mockTest, ...current]);
        setSuccess("Mock test created successfully.");
      }

      closeMockModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save mock test.",
      );
    } finally {
      setSavingMock(false);
    }
  }

  async function handleToggleMockPublish(mock: MockTest) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    try {
      const response = await updateMockTest(token, mock.id, {
        isPublished: !mock.isPublished,
      });

      setMockTests((current) =>
        current.map((item) =>
          item.id === mock.id ? response.mockTest : item,
        ),
      );

      setSuccess(
        response.mockTest.isPublished
          ? "Mock test published successfully."
          : "Mock test moved to draft.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update mock test status.",
      );
    }
  }

  async function handleDeleteMock(mock: MockTest) {
    if (!token) {
      setError("Your administrator session has expired.");
      return;
    }

    if (
      !window.confirm(
        `Delete "${mock.title}"?\n\nThis will only succeed if the mock test has no questions.`,
      )
    ) {
      return;
    }

    setDeletingMockId(mock.id);
    setError("");

    try {
      await deleteMockTest(token, mock.id);
      setMockTests((current) =>
        current.filter((item) => item.id !== mock.id),
      );
      setSuccess("Mock test deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete mock test.",
      );
    } finally {
      setDeletingMockId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-9">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Exam Management
              </div>

              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Manage your exam ecosystem
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                Build the complete assessment structure from target exams to
                test series, timed mock tests and question banks.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => openCreateMockModal()}
                disabled={testSeries.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Target className="h-4 w-4" />
                Create Mock Test
              </button>

              <button
                type="button"
                onClick={() => openCreateSeriesModal()}
                disabled={exams.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Layers3 className="h-4 w-4" />
                Create Test Series
              </button>

              <button
                type="button"
                onClick={openCreateExamModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
              >
                <CirclePlus className="h-4 w-4" />
                Create Exam
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-7 lg:px-9">
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="ml-auto rounded-lg p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<BookOpenCheck className="h-5 w-5" />}
            label="Total Exams"
            value={examStats.total}
            detail={`${examStats.published} published Â· ${examStats.drafts} drafts`}
          />
          <StatCard
            icon={<Layers3 className="h-5 w-5" />}
            label="Test Series"
            value={seriesStats.total}
            detail={`${seriesStats.published} published Â· ${seriesStats.premium} premium`}
          />
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Mock Tests"
            value={mockStats.total}
            detail={`${mockStats.published} published Â· ${mockStats.drafts} drafts`}
            positive
          />
          <StatCard
            icon={<FileQuestion className="h-5 w-5" />}
            label="Configured Questions"
            value={mockStats.questions}
            detail={`${mockStats.premium} premium mock tests`}
          />
        </div>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <SectionHeader
            title="Exams"
            description={`${filteredExams.length} of ${exams.length} exams shown`}
            search={search}
            onSearch={setSearch}
            placeholder="Search exams..."
            filterValue={statusFilter}
            onFilter={(value) => setStatusFilter(value as StatusFilter)}
            onRefresh={refreshAll}
            loading={loadingExams || loadingSeries || loadingMocks}
            onAdd={openCreateExamModal}
            addLabel="Add Exam"
          />

          {loadingExams ? (
            <LoadingState label="Loading exams..." />
          ) : filteredExams.length === 0 ? (
            <EmptyState
              title={
                exams.length === 0
                  ? "No exams created yet"
                  : "No exams match your filters"
              }
              description={
                exams.length === 0
                  ? "Create your first exam to start building its test series and mock tests."
                  : "Try another search term or change the status filter."
              }
              action={
                exams.length === 0
                  ? { label: "Create First Exam", onClick: openCreateExamModal }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className={tableHeadClass}>Exam</th>
                    <th className={tableHeadClass}>Category</th>
                    <th className={tableHeadClass}>Status</th>
                    <th className={tableHeadClass}>Slug</th>
                    <th className={`${tableHeadClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="group transition hover:bg-violet-50/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex min-w-[250px] items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-black text-white shadow-md shadow-violet-100">
                            {(exam.shortName ||
                              exam.name.slice(0, 2)).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-black text-slate-900">
                              {exam.name}
                            </p>
                            {exam.shortName && (
                              <p className="mt-0.5 text-xs font-medium text-slate-400">
                                {exam.shortName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                          {exam.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <StatusButton
                          published={exam.isPublished}
                          onClick={() => handleToggleExamPublish(exam)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                          {exam.slug}
                        </code>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            icon={<Layers3 className="h-3.5 w-3.5" />}
                            label="Series"
                            tone="violet"
                            onClick={() => openCreateSeriesModal(exam.id)}
                          />
                          <ActionButton
                            icon={<Edit3 className="h-3.5 w-3.5" />}
                            label="Edit"
                            onClick={() => openEditExamModal(exam)}
                          />
                          <ActionButton
                            icon={
                              deletingExamId === exam.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )
                            }
                            label="Delete"
                            tone="danger"
                            disabled={deletingExamId === exam.id}
                            onClick={() => handleDeleteExam(exam)}
                          />
                          <button
                            type="button"
                            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 sm:inline-flex"
                            aria-label={`More options for ${exam.name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <SectionHeader
            title="Test Series"
            description={`${filteredSeries.length} of ${testSeries.length} series shown`}
            search={seriesSearch}
            onSearch={setSeriesSearch}
            placeholder="Search test series..."
            filterValue={seriesStatusFilter}
            onFilter={(value) =>
              setSeriesStatusFilter(value as StatusFilter)
            }
            secondaryFilter={{
              value: seriesExamFilter,
              onChange: setSeriesExamFilter,
              options: exams.map((exam) => ({
                value: exam.id,
                label: exam.name,
              })),
              allLabel: "All exams",
            }}
            onAdd={() => openCreateSeriesModal()}
            addLabel="Add Series"
          />

          {loadingSeries ? (
            <LoadingState label="Loading test series..." />
          ) : filteredSeries.length === 0 ? (
            <EmptyState
              title={
                testSeries.length === 0
                  ? "No test series created yet"
                  : "No test series match your filters"
              }
              description={
                testSeries.length === 0
                  ? "Create a test series under an exam to continue building the mock test system."
                  : "Try another search term, exam or status filter."
              }
              action={
                testSeries.length === 0 && exams.length > 0
                  ? {
                      label: "Create First Series",
                      onClick: () => openCreateSeriesModal(),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className={tableHeadClass}>Test Series</th>
                    <th className={tableHeadClass}>Exam</th>
                    <th className={tableHeadClass}>Access</th>
                    <th className={tableHeadClass}>Status</th>
                    <th className={tableHeadClass}>Price</th>
                    <th className={`${tableHeadClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSeries.map((series) => (
                    <tr
                      key={series.id}
                      className="transition hover:bg-violet-50/30"
                    >
                      <td className="px-6 py-5">
                        <div className="min-w-[250px]">
                          <p className="text-sm font-black text-slate-900">
                            {series.title}
                          </p>
                          <p className="mt-1 max-w-[340px] truncate text-xs font-medium text-slate-400">
                            {series.description || "No description added"}
                          </p>
                          <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                            {series.slug}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                          {getExamName(series.exam)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <AccessBadge premium={series.accessType === "PREMIUM"} />
                      </td>
                      <td className="px-6 py-5">
                        <StatusButton
                          published={series.isPublished}
                          onClick={() => handleToggleSeriesPublish(series)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        {series.accessType === "PREMIUM" ? (
                          series.discountPrice > 0 ? (
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                â‚¹{series.discountPrice.toLocaleString("en-IN")}
                              </p>
                              <p className="text-xs font-medium text-slate-400 line-through">
                                â‚¹{series.price.toLocaleString("en-IN")}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm font-black text-slate-900">
                              â‚¹{series.price.toLocaleString("en-IN")}
                            </p>
                          )
                        ) : (
                          <span className="text-sm font-black text-emerald-600">
                            Free
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            icon={<Target className="h-3.5 w-3.5" />}
                            label="Mock"
                            tone="violet"
                            onClick={() => openCreateMockModal(series.id)}
                          />
                          <ActionButton
                            icon={<Edit3 className="h-3.5 w-3.5" />}
                            label="Edit"
                            onClick={() => openEditSeriesModal(series)}
                          />
                          <ActionButton
                            icon={
                              deletingSeriesId === series.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )
                            }
                            label="Delete"
                            tone="danger"
                            disabled={deletingSeriesId === series.id}
                            onClick={() => handleDeleteSeries(series)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-3xl border border-red-100/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <SectionHeader
            title="Mock Tests"
            description={`${filteredMocks.length} of ${mockTests.length} mock tests shown`}
            search={mockSearch}
            onSearch={setMockSearch}
            placeholder="Search mock tests..."
            filterValue={mockStatusFilter}
            onFilter={(value) => setMockStatusFilter(value as StatusFilter)}
            secondaryFilter={{
              value: mockSeriesFilter,
              onChange: setMockSeriesFilter,
              options: testSeries.map((series) => ({
                value: series.id,
                label: series.title,
              })),
              allLabel: "All test series",
            }}
            onAdd={() => openCreateMockModal()}
            addLabel="Add Mock Test"
            addDisabled={testSeries.length === 0}
            accent="red"
          />

          <div className="grid gap-3 border-b border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-3 lg:grid-cols-5">
            <MiniMetric label="Total" value={mockStats.total} />
            <MiniMetric label="Published" value={mockStats.published} />
            <MiniMetric label="Drafts" value={mockStats.drafts} />
            <MiniMetric label="Premium" value={mockStats.premium} />
            <MiniMetric label="Questions" value={mockStats.questions} />
          </div>

          {loadingMocks ? (
            <LoadingState label="Loading mock tests..." />
          ) : filteredMocks.length === 0 ? (
            <EmptyState
              title={
                mockTests.length === 0
                  ? "No mock tests created yet"
                  : "No mock tests match your filters"
              }
              description={
                mockTests.length === 0
                  ? "Create a timed mock test inside a test series. Questions can be added in the next Question Bank step."
                  : "Try another search term, series or status filter."
              }
              action={
                mockTests.length === 0 && testSeries.length > 0
                  ? {
                      label: "Create First Mock Test",
                      onClick: () => openCreateMockModal(),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className={tableHeadClass}>Mock Test</th>
                    <th className={tableHeadClass}>Series / Exam</th>
                    <th className={tableHeadClass}>Configuration</th>
                    <th className={tableHeadClass}>Access</th>
                    <th className={tableHeadClass}>Status</th>
                    <th className={`${tableHeadClass} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMocks.map((mock) => (
                    <tr
                      key={mock.id}
                      className="transition hover:bg-red-50/20"
                    >
                      <td className="px-6 py-5">
                        <div className="min-w-[250px]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                              <Target className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-slate-900">
                                {mock.title}
                              </p>
                              <p className="mt-0.5 text-xs font-medium text-slate-400">
                                {mock.totalQuestions} questions
                              </p>
                            </div>
                          </div>
                          <code className="mt-2 inline-block rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-400">
                            {mock.slug}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-black text-violet-700">
                          {getSeriesName(mock.testSeries)}
                        </p>
                        <p className="mt-1 text-xs font-medium text-slate-400">
                          {getSeriesExam(mock.testSeries)}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex min-w-[190px] flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            <Clock3 className="h-3 w-3" />
                            {mock.durationMinutes} min
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                            <Trophy className="h-3 w-3" />
                            +{mock.marksPerQuestion}
                          </span>
                          {mock.negativeMarking > 0 && (
                            <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-600">
                              -{mock.negativeMarking}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <AccessBadge premium={mock.accessType === "PREMIUM"} />
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                          {mock.attemptLimit > 0
                            ? `${mock.attemptLimit} attempt${mock.attemptLimit === 1 ? "" : "s"}`
                            : "Unlimited attempts"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StatusButton
                          published={mock.isPublished}
                          onClick={() => handleToggleMockPublish(mock)}
                        />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            icon={<FileQuestion className="h-3.5 w-3.5" />}
                            label="Questions"
                            tone="violet"
                            onClick={() => openQuestionBank(mock)}
                          />
                          <ActionButton
                            icon={<Edit3 className="h-3.5 w-3.5" />}
                            label="Edit"
                            onClick={() => openEditMockModal(mock)}
                          />
                          <ActionButton
                            icon={
                              deletingMockId === mock.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )
                            }
                            label="Delete"
                            tone="danger"
                            disabled={deletingMockId === mock.id}
                            onClick={() => handleDeleteMock(mock)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-violet-700">
                <Layers3 className="h-4 w-4" />
                Assessment workflow
              </div>
              <h3 className="mt-2 text-lg font-black text-slate-950">
                Exam â†’ Test Series â†’ Mock Test â†’ Questions
              </h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Exams define the target examination. Test series organize the
                assessment products. Mock tests define the timed papers and
                scoring rules. The Question Bank will populate each paper.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["Exam", "Series", "Mock", "Questions"].map((item, index) => (
                <div
                  key={item}
                  className="rounded-xl border border-white bg-white/80 px-3 py-2 text-center shadow-sm"
                >
                  <div className="text-[10px] font-black text-violet-500">
                    0{index + 1}
                  </div>
                  <div className="mt-1 text-[11px] font-bold text-slate-600">
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {examModalOpen && (
        <ModalShell
          title={editingExam ? "Edit Exam" : "Create Exam"}
          subtitle="Configure the basic exam information."
          onClose={closeExamModal}
          disabled={savingExam}
        >
          <form onSubmit={handleExamSubmit} className="space-y-5 p-6">
            {error && <ModalError message={error} />}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Exam Name" required>
                <input
                  value={examForm.name}
                  onChange={(event) =>
                    updateExamField("name", event.target.value)
                  }
                  placeholder="e.g. SBI PO"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Short Name">
                <input
                  value={examForm.shortName}
                  onChange={(event) =>
                    updateExamField("shortName", event.target.value)
                  }
                  placeholder="e.g. PO"
                  className={inputClass}
                />
              </Field>

              <Field label="Category" required>
                <select
                  value={examForm.category}
                  onChange={(event) =>
                    updateExamField("category", event.target.value)
                  }
                  className={inputClass}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Sort Order">
                <input
                  type="number"
                  min="0"
                  value={examForm.sortOrder}
                  onChange={(event) =>
                    updateExamField("sortOrder", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={examForm.description}
                onChange={(event) =>
                  updateExamField("description", event.target.value)
                }
                placeholder="Brief description of this exam..."
                rows={4}
                className={`${inputClass} min-h-[110px] resize-y py-3`}
              />
            </Field>

            <PublishToggle
              checked={examForm.isPublished}
              onChange={(value) => updateExamField("isPublished", value)}
              title="Publish this exam"
              description="Published exams can appear in the student exam catalogue."
            />

            <ModalActions
              onCancel={closeExamModal}
              saving={savingExam}
              submitLabel={editingExam ? "Save Changes" : "Create Exam"}
            />
          </form>
        </ModalShell>
      )}

      {seriesModalOpen && (
        <ModalShell
          title={editingSeries ? "Edit Test Series" : "Create Test Series"}
          subtitle="Configure the test series under an exam."
          onClose={closeSeriesModal}
          disabled={savingSeries}
        >
          <form onSubmit={handleSeriesSubmit} className="space-y-5 p-6">
            {error && <ModalError message={error} />}

            <Field label="Parent Exam" required>
              <select
                value={seriesForm.exam}
                onChange={(event) =>
                  updateSeriesField("exam", event.target.value)
                }
                className={inputClass}
                required
              >
                <option value="">Select exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Test Series Title" required>
                <input
                  value={seriesForm.title}
                  onChange={(event) =>
                    updateSeriesField("title", event.target.value)
                  }
                  placeholder="e.g. SBI PO Full Mock Series"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Sort Order">
                <input
                  type="number"
                  min="0"
                  value={seriesForm.sortOrder}
                  onChange={(event) =>
                    updateSeriesField("sortOrder", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={seriesForm.description}
                onChange={(event) =>
                  updateSeriesField("description", event.target.value)
                }
                placeholder="Describe what this test series contains..."
                rows={4}
                className={`${inputClass} min-h-[110px] resize-y py-3`}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Access Type" required>
                <select
                  value={seriesForm.accessType}
                  onChange={(event) =>
                    updateSeriesField(
                      "accessType",
                      event.target.value as "FREE" | "PREMIUM",
                    )
                  }
                  className={inputClass}
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </Field>

              <Field label="Price">
                <input
                  type="number"
                  min="0"
                  value={seriesForm.price}
                  onChange={(event) =>
                    updateSeriesField("price", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Discount Price">
                <input
                  type="number"
                  min="0"
                  value={seriesForm.discountPrice}
                  onChange={(event) =>
                    updateSeriesField("discountPrice", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-violet-600">
                Pricing
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Free series should use zero pricing. Premium series can use an
                original price and optional discounted price.
              </p>
            </div>

            <PublishToggle
              checked={seriesForm.isPublished}
              onChange={(value) => updateSeriesField("isPublished", value)}
              title="Publish this test series"
              description="Published series can appear under the selected exam for students."
            />

            <ModalActions
              onCancel={closeSeriesModal}
              saving={savingSeries}
              submitLabel={
                editingSeries ? "Save Changes" : "Create Test Series"
              }
            />
          </form>
        </ModalShell>
      )}

      {mockModalOpen && (
        <ModalShell
          title={editingMock ? "Edit Mock Test" : "Create Mock Test"}
          subtitle="Configure the timed paper, scoring and access rules."
          onClose={closeMockModal}
          disabled={savingMock}
          wide
        >
          <form onSubmit={handleMockSubmit} className="space-y-5 p-6">
            {error && <ModalError message={error} />}

            <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-black text-red-800">
                    Mock Test Configuration
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-700/80">
                    Question count is calculated automatically when questions
                    are added to this mock test.
                  </p>
                </div>
              </div>
            </div>

            <Field label="Parent Test Series" required>
              <select
                value={mockForm.testSeries}
                onChange={(event) =>
                  updateMockField("testSeries", event.target.value)
                }
                className={inputClass}
                required
              >
                <option value="">Select test series</option>
                {testSeries.map((series) => (
                  <option key={series.id} value={series.id}>
                    {series.title} â€” {getExamName(series.exam)}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Mock Test Title" required>
                <input
                  value={mockForm.title}
                  onChange={(event) =>
                    updateMockField("title", event.target.value)
                  }
                  placeholder="e.g. SBI PO Mock Test 01"
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Sort Order">
                <input
                  type="number"
                  min="0"
                  value={mockForm.sortOrder}
                  onChange={(event) =>
                    updateMockField("sortOrder", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={mockForm.description}
                onChange={(event) =>
                  updateMockField("description", event.target.value)
                }
                placeholder="Describe this mock test..."
                rows={3}
                className={`${inputClass} min-h-[90px] resize-y py-3`}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Duration (minutes)" required>
                <input
                  type="number"
                  min="1"
                  value={mockForm.durationMinutes}
                  onChange={(event) =>
                    updateMockField("durationMinutes", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Marks / Question" required>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={mockForm.marksPerQuestion}
                  onChange={(event) =>
                    updateMockField("marksPerQuestion", event.target.value)
                  }
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Negative Marking">
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={mockForm.negativeMarking}
                  onChange={(event) =>
                    updateMockField("negativeMarking", event.target.value)
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Attempt Limit">
                <input
                  type="number"
                  min="0"
                  value={mockForm.attemptLimit}
                  onChange={(event) =>
                    updateMockField("attemptLimit", event.target.value)
                  }
                  className={inputClass}
                />
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  0 = unlimited
                </p>
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Access Type" required>
                <select
                  value={mockForm.accessType}
                  onChange={(event) =>
                    updateMockField(
                      "accessType",
                      event.target.value as "FREE" | "PREMIUM",
                    )
                  }
                  className={inputClass}
                >
                  <option value="FREE">Free</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </Field>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                  Current scoring
                </p>
                <p className="mt-1 text-sm font-black text-slate-800">
                  +{mockForm.marksPerQuestion || "0"} correct
                  {Number(mockForm.negativeMarking) > 0
                    ? ` Â· -${mockForm.negativeMarking} incorrect`
                    : " Â· no negative marking"}
                </p>
              </div>
            </div>

            <Field label="Instructions">
              <textarea
                value={mockForm.instructions}
                onChange={(event) =>
                  updateMockField("instructions", event.target.value)
                }
                placeholder={
                  "Enter one instruction per line.\nDo not refresh the test while attempting.\nSubmit before the timer ends."
                }
                rows={6}
                className={`${inputClass} min-h-[150px] resize-y py-3`}
              />
              <p className="mt-1.5 text-[11px] font-medium text-slate-400">
                Each non-empty line becomes a separate instruction.
              </p>
            </Field>

            <PublishToggle
              checked={mockForm.isPublished}
              onChange={(value) => updateMockField("isPublished", value)}
              title="Publish this mock test"
              description="Published mock tests become eligible for the student test catalogue."
            />

            <ModalActions
              onCancel={closeMockModal}
              saving={savingMock}
              submitLabel={editingMock ? "Save Changes" : "Create Mock Test"}
            />
          </form>
        </ModalShell>
      )}

      {questionModalOpen && selectedMockForQuestions && (
        <ModalShell
          title="Question Bank"
          subtitle={`Manage questions for ${selectedMockForQuestions.title}`}
          onClose={closeQuestionBank}
          disabled={Boolean(savingQuestion || deletingQuestionId)}
          wide
        >
          <div className="space-y-6 p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-violet-500">
                  Mock Test
                </p>
                <p className="mt-1 line-clamp-2 text-sm font-black text-slate-900">
                  {selectedMockForQuestions.title}
                </p>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                  Questions
                </p>
                <p className="mt-1 text-xl font-black text-slate-900">
                  {questions.length}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
                  Duration
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {selectedMockForQuestions.durationMinutes} min
                </p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  Access
                </p>
                <p className="mt-1 text-sm font-black text-slate-900">
                  {selectedMockForQuestions.accessType}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Question Bank
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Create, edit and manage the questions for this mock test.
                </p>
              </div>

              <ActionButton
                icon={<CirclePlus className="h-4 w-4" />}
                label="Add Question"
                tone="violet"
                onClick={openCreateQuestion}
              />
            </div>

            {questionFormOpen && (
              <form
                onSubmit={handleQuestionSubmit}
                className="rounded-3xl border border-violet-100 bg-violet-50/30 p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      {editingQuestion ? "Edit Question" : "Create Question"}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Add the question, answer options and metadata.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeQuestionForm}
                    disabled={savingQuestion}
                    className="rounded-xl p-2 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Close question form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <Field label="Question" required>
                    <textarea
                      value={questionForm.questionText}
                      onChange={(event) =>
                        updateQuestionField("questionText", event.target.value)
                      }
                      placeholder="Enter the question..."
                      rows={4}
                      className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-50"
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Option A" required>
                      <input
                        value={questionForm.optionA}
                        onChange={(event) =>
                          updateQuestionField("optionA", event.target.value)
                        }
                        placeholder="Enter option A"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Option B" required>
                      <input
                        value={questionForm.optionB}
                        onChange={(event) =>
                          updateQuestionField("optionB", event.target.value)
                        }
                        placeholder="Enter option B"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Option C" required>
                      <input
                        value={questionForm.optionC}
                        onChange={(event) =>
                          updateQuestionField("optionC", event.target.value)
                        }
                        placeholder="Enter option C"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Option D" required>
                      <input
                        value={questionForm.optionD}
                        onChange={(event) =>
                          updateQuestionField("optionD", event.target.value)
                        }
                        placeholder="Enter option D"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Correct Answer" required>
                      <select
                        value={questionForm.correctAnswer}
                        onChange={(event) =>
                          updateQuestionField(
                            "correctAnswer",
                            event.target.value as "A" | "B" | "C" | "D",
                          )
                        }
                        className={inputClass}
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </Field>

                    <Field label="Difficulty">
                      <select
                        value={questionForm.difficulty}
                        onChange={(event) =>
                          updateQuestionField(
                            "difficulty",
                            event.target.value as "EASY" | "MEDIUM" | "HARD",
                          )
                        }
                        className={inputClass}
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </Field>

                    <Field label="Order" required>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={questionForm.order}
                        onChange={(event) =>
                          updateQuestionField("order", event.target.value)
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Subject">
                      <input
                        value={questionForm.subject}
                        onChange={(event) =>
                          updateQuestionField("subject", event.target.value)
                        }
                        placeholder="e.g. Geology"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Topic">
                      <input
                        value={questionForm.topic}
                        onChange={(event) =>
                          updateQuestionField("topic", event.target.value)
                        }
                        placeholder="e.g. Structural Geology"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Explanation">
                    <textarea
                      value={questionForm.explanation}
                      onChange={(event) =>
                        updateQuestionField("explanation", event.target.value)
                      }
                      placeholder="Optional explanation for the correct answer..."
                      rows={3}
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:ring-4 focus:ring-violet-50"
                    />
                  </Field>

                  <ModalActions
                    onCancel={closeQuestionForm}
                    saving={savingQuestion}
                    submitLabel={
                      editingQuestion ? "Update Question" : "Create Question"
                    }
                  />
                </div>
              </form>
            )}

            {error && <ModalError message={error} />}

            {loadingQuestions ? (
              <LoadingState label="Loading questions..." />
            ) : questions.length === 0 ? (
              <EmptyState
                title="No questions yet"
                description="This mock test does not have any questions. Add the first question to start building the paper."
                action={{
                  label: "Add First Question",
                  onClick: openCreateQuestion,
                }}
              />
            ) : (
              <div className="space-y-4">
                {questions
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((question, index) => (
                    <div
                      key={question.id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                    >
                      <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-black text-violet-700">
                              {question.order || index + 1}
                            </div>

                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-violet-700">
                                  {question.difficulty}
                                </span>

                                {question.subject && (
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                                    {question.subject}
                                  </span>
                                )}

                                {question.topic && (
                                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                    {question.topic}
                                  </span>
                                )}
                              </div>

                              <p className="whitespace-pre-wrap text-sm font-bold leading-6 text-slate-900">
                                {question.questionText}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <ActionButton
                              icon={<Edit3 className="h-3.5 w-3.5" />}
                              label="Edit"
                              tone="violet"
                              onClick={() => openEditQuestion(question)}
                            />

                            <ActionButton
                              icon={
                                deletingQuestionId === question.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )
                              }
                              label="Delete"
                              tone="danger"
                              onClick={() => handleDeleteQuestion(question)}
                              disabled={Boolean(
                                deletingQuestionId &&
                                  deletingQuestionId !== question.id,
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 p-5 md:grid-cols-2">
                        {question.options.map((option) => {
                          const isCorrect =
                            question.correctAnswer === option.key;

                          return (
                            <div
                              key={`${question.id}-${option.key}`}
                              className={`rounded-2xl border p-4 ${
                                isCorrect
                                  ? "border-emerald-200 bg-emerald-50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                    isCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-white text-slate-600"
                                  }`}
                                >
                                  {option.key}
                                </span>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold leading-6 text-slate-800">
                                    {option.text}
                                  </p>

                                  {isCorrect && (
                                    <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-emerald-600">
                                      Correct Answer
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {question.explanation && (
                        <div className="border-t border-slate-100 bg-amber-50/50 px-5 py-4">
                          <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">
                            Explanation
                          </p>
                          <p className="mt-1 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                            {question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}

            {!questionFormOpen && questions.length > 0 && (
              <div className="flex justify-center border-t border-slate-100 pt-5">
                <ActionButton
                  icon={<CirclePlus className="h-4 w-4" />}
                  label="Add Another Question"
                  tone="violet"
                  onClick={openCreateQuestion}
                />
              </div>
            )}
          </div>
        </ModalShell>
      )}

    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-50";

const tableHeadClass =
  "px-6 py-3 text-left text-[10px] font-black uppercase tracking-[0.16em] text-slate-400";

function SectionHeader({
  title,
  description,
  search,
  onSearch,
  placeholder,
  filterValue,
  onFilter,
  secondaryFilter,
  onRefresh,
  loading = false,
  onAdd,
  addLabel,
  addDisabled = false,
  accent = "violet",
}: {
  title: string;
  description: string;
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  filterValue: StatusFilter;
  onFilter: (value: string) => void;
  secondaryFilter?: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    allLabel: string;
  };
  onRefresh?: () => void;
  loading?: boolean;
  onAdd: () => void;
  addLabel: string;
  addDisabled?: boolean;
  accent?: "violet" | "red";
}) {
  const buttonClass =
    accent === "red"
      ? "bg-red-600 shadow-red-100 hover:bg-red-700"
      : "bg-violet-600 shadow-violet-100 hover:bg-violet-700";

  return (
    <div className="border-b border-slate-200/80 p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <div className="relative min-w-0 sm:w-[250px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={placeholder}
              className={`${inputClass} pl-10`}
            />
          </div>

          {secondaryFilter && (
            <SelectFilter
              value={secondaryFilter.value}
              onChange={secondaryFilter.onChange}
              options={secondaryFilter.options}
              allLabel={secondaryFilter.allLabel}
            />
          )}

          <SelectFilter
            value={filterValue}
            onChange={onFilter}
            options={[
              { value: "PUBLISHED", label: "Published" },
              { value: "DRAFT", label: "Drafts" },
            ]}
            allLabel="All statuses"
          />

          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          )}

          <button
            type="button"
            onClick={onAdd}
            disabled={addDisabled}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClass}`}
          >
            <CirclePlus className="h-4 w-4" />
            {addLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <label className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass} appearance-none pr-10`}
      >
        <option value="ALL">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </label>
  );
}

function StatusButton({
  published,
  onClick,
}: {
  published: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        published
          ? "inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 transition hover:bg-emerald-100"
          : "inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 transition hover:bg-amber-100"
      }
    >
      <span
        className={
          published
            ? "h-1.5 w-1.5 rounded-full bg-emerald-500"
            : "h-1.5 w-1.5 rounded-full bg-amber-500"
        }
      />
      {published ? "Published" : "Draft"}
    </button>
  );
}

function AccessBadge({ premium }: { premium: boolean }) {
  return premium ? (
    <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
      Premium
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
      Free
    </span>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  tone = "default",
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "violet" | "danger";
  disabled?: boolean;
}) {
  const toneClass =
    tone === "violet"
      ? "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100"
      : tone === "danger"
        ? "border-red-100 bg-white text-red-600 hover:bg-red-50"
        : "border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${toneClass}`}
    >
      {icon}
      {label}
    </button>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={
            positive
              ? "flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"
              : "flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600"
          }
        >
          {icon}
        </div>
        <span className="text-2xl font-black tracking-tight text-slate-950">
          {value}
        </span>
      </div>
      <p className="mt-4 text-sm font-black text-slate-800">{label}</p>
      <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>
    </div>
  );
}

function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
        <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex min-h-[260px] items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Layers3 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
          >
            <CirclePlus className="h-4 w-4" />
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  disabled,
  children,
  wide = false,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  disabled: boolean;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-white/70 bg-white shadow-2xl ${
          wide ? "max-w-4xl" : "max-w-2xl"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur-xl">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-1 text-xs font-medium text-slate-400">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

function PublishToggle({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-violet-200 hover:bg-violet-50/50">
      <div>
        <p className="text-sm font-black text-slate-800">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
      />
    </label>
  );
}

function ModalActions({
  onCancel,
  saving,
  submitLabel,
}: {
  onCancel: () => void;
  saving: boolean;
  submitLabel: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitLabel}
      </button>
    </div>
  );
}
