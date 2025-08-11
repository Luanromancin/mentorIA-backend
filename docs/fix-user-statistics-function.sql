-- Corrigir a função get_user_statistics para usar níveis reais da user_competencies
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a função antiga primeiro
DROP FUNCTION IF EXISTS get_user_statistics(UUID);

-- 2. Criar nova função corrigida
CREATE OR REPLACE FUNCTION get_user_statistics(user_profile_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  WITH general_stats AS (
    SELECT 
      COALESCE(SUM(questions_answered), 0) as total_questions,
      COALESCE(SUM(correct_answers), 0) as total_correct,
      CASE 
        WHEN COALESCE(SUM(questions_answered), 0) > 0 
        THEN ROUND((COALESCE(SUM(correct_answers), 0)::DECIMAL / SUM(questions_answered)) * 100, 2)
        ELSE 0 
      END as overall_accuracy
    FROM user_statistics 
    WHERE user_id = user_profile_id
  ),
  topic_stats AS (
    SELECT 
      topic_name,
      SUM(questions_answered) as total_questions,
      SUM(correct_answers) as total_correct,
      CASE 
        WHEN SUM(questions_answered) > 0 
        THEN ROUND((SUM(correct_answers)::DECIMAL / SUM(questions_answered)) * 100, 2)
        ELSE 0 
      END as accuracy,
      -- Calcular progresso baseado em subtópicos dominados (nível 3)
      CASE 
        WHEN COUNT(*) > 0 
        THEN ROUND((COUNT(CASE WHEN COALESCE(uc.level, 0) = 3 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
        ELSE 0 
      END as topic_progress
    FROM user_statistics us
    LEFT JOIN user_competencies uc ON 
      uc.profile_id = user_profile_id AND 
      uc.competency_id = (
        SELECT c.id FROM competencies c 
        WHERE c.name = us.subtopic_name 
        LIMIT 1
      )
    WHERE us.user_id = user_profile_id
    GROUP BY topic_name
    ORDER BY topic_name
  ),
  competency_stats AS (
    SELECT 
      us.subtopic_name,
      us.questions_answered,
      us.correct_answers,
      CASE 
        WHEN us.questions_answered > 0 
        THEN ROUND((us.correct_answers::DECIMAL / us.questions_answered) * 100, 2)
        ELSE 0 
      END as accuracy,
      COALESCE(uc.level, 0) as mastery_level
    FROM user_statistics us
    LEFT JOIN user_competencies uc ON 
      uc.profile_id = user_profile_id AND 
      uc.competency_id = (
        SELECT c.id FROM competencies c 
        WHERE c.name = us.subtopic_name 
        LIMIT 1
      )
    WHERE us.user_id = user_profile_id
    ORDER BY us.topic_name, us.subtopic_name
  ),
  study_streak_stats AS (
    SELECT 
      get_user_study_streak(user_profile_id) as current_streak,
      COUNT(*) as total_completed_days
    FROM user_study_streaks 
    WHERE profile_id = user_profile_id 
    AND completed_daily_goal = true
  ),
  completed_tests_stats AS (
    SELECT 
      COUNT(*) as total_completed_tests
    FROM user_study_streaks 
    WHERE profile_id = user_profile_id 
    AND completed_daily_goal = true
  )
  SELECT json_build_object(
    'general', (
      SELECT json_build_object(
        'total_questions', total_questions,
        'total_correct', total_correct,
        'overall_accuracy', overall_accuracy,
        'study_streak', COALESCE((SELECT current_streak FROM study_streak_stats), 0),
        'completed_tests', COALESCE((SELECT total_completed_tests FROM completed_tests_stats), 0)
      ) FROM general_stats
    ),
    'by_topic', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'name', topic_name,
          'questions_answered', total_questions,
          'correct_answers', total_correct,
          'accuracy', accuracy,
          'topic_progress', topic_progress
        )
      ) FROM topic_stats), '[]'::json
    ),
    'by_competency', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'name', subtopic_name,
          'questions_answered', questions_answered,
          'correct_answers', correct_answers,
          'accuracy', accuracy,
          'mastery_level', mastery_level
        )
      ) FROM competency_stats), '[]'::json
    )
  ) INTO result;
  
  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Testar a função
SELECT get_user_statistics('8691e88d-c6d8-4011-822d-fb5db400035d');
