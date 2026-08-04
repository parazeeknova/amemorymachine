-- Optional research entry: the CICBA 2025 / Springer paper. Lives in the
-- experience table with section 'research' so the portfolio can show it
-- under its own tab; users without one simply don't get the tab.

INSERT INTO portfolio_experiences (profile_id, title, location, period, description, section, position)
SELECT p.id,
  'Fine-Tuning for Code Intelligence: Evaluating LLMs on Custom Programming Benchmarks',
  'Springer · CICBA 2025',
  '2026',
  'This work investigates how small language models — particularly those in the 1B–3B parameter range — can be fine-tuned to handle programming tasks more effectively. Motivated by the growing interest in running AI models on limited hardware, we evaluate parameter-efficient fine-tuning approaches including Low-Rank Adaptation (LoRA), Quantised Low-Rank Adaptation (QLoRA), and Unsloth to improve performance without requiring expensive resources. Rather than constructing a new dataset, we leverage existing coding problem datasets from platforms such as LeetCode and Codeforces, whose challenges, test cases, and solutions provide a robust basis for evaluating code generation and reasoning. Fine-tuning surfaced common practical hurdles — memory limits, long training times, and occasional instability, particularly on lower-end GPUs — yet the tuned models showed consistent gains: fine-tuned versions solved programming problems noticeably better and exhibited stronger reasoning than their base counterparts. Our results suggest that even smaller models can deliver meaningful code intelligence when trained carefully, making them viable for everyday scenarios where large-scale hardware is unavailable. [Read the paper](https://link.springer.com/chapter/10.1007/978-3-032-17184-9_28) · [ORCID](https://orcid.org/0009-0008-9861-9181)',
  'research',
  10
FROM portfolio_profiles p WHERE p.is_pinned = true;
