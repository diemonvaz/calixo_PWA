-- Row-Level Security (RLS) Policies for Calixo PWA
-- Este archivo contiene todas las políticas de seguridad para Supabase
-- Ejecutar estas políticas después de aplicar las migraciones

-- ============================================
-- 1. ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatar_customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================

-- Users can view their own data
CREATE POLICY "Users can view own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view public profiles
CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (is_private = false);

-- Users can view private profiles if they follow them
CREATE POLICY "Users can view followed private profiles"
  ON profiles FOR SELECT
  USING (
    is_private = true 
    AND EXISTS (
      SELECT 1 FROM followers 
      WHERE follower_id = auth.uid() 
      AND following_id = user_id
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. CHALLENGES TABLE POLICIES
-- ============================================

-- Everyone can view active challenges
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (is_active = true);

-- Only admins can insert challenges
CREATE POLICY "Only admins can insert challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can update challenges
CREATE POLICY "Only admins can update challenges"
  ON challenges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 5. USER_CHALLENGES TABLE POLICIES
-- ============================================

-- Users can view their own challenges
CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own challenges
CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own challenges
CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. FOCUS_SESSIONS TABLE POLICIES
-- ============================================

-- Users can view their own focus sessions
CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE id = user_challenge_id 
      AND user_id = auth.uid()
    )
  );

-- Users can insert their own focus sessions
CREATE POLICY "Users can insert own focus sessions"
  ON focus_sessions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE id = user_challenge_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- 7. SOCIAL_SESSIONS TABLE POLICIES
-- ============================================

-- Users can view social sessions they're part of
CREATE POLICY "Users can view own social sessions"
  ON social_sessions FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- Users can insert social sessions as inviter
CREATE POLICY "Users can create social sessions"
  ON social_sessions FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

-- Users can update social sessions they're part of
CREATE POLICY "Users can update own social sessions"
  ON social_sessions FOR UPDATE
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- ============================================
-- 8. AVATAR_CUSTOMIZATIONS TABLE POLICIES
-- ============================================

-- Users can view their own customizations
CREATE POLICY "Users can view own customizations"
  ON avatar_customizations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own customizations
CREATE POLICY "Users can insert own customizations"
  ON avatar_customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own customizations
CREATE POLICY "Users can update own customizations"
  ON avatar_customizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own customizations
CREATE POLICY "Users can delete own customizations"
  ON avatar_customizations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. STORE_ITEMS TABLE POLICIES
-- ============================================

-- Everyone can view active store items
CREATE POLICY "Anyone can view active store items"
  ON store_items FOR SELECT
  USING (is_active = true);

-- Only admins can manage store items
CREATE POLICY "Only admins can manage store items"
  ON store_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 10. TRANSACTIONS TABLE POLICIES
-- ============================================

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own transactions
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. FOLLOWERS TABLE POLICIES
-- ============================================

-- Users can view their own follower relationships
CREATE POLICY "Users can view own followers"
  ON followers FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Users can insert follow relationships where they are the follower
CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete follow relationships where they are the follower
CREATE POLICY "Users can unfollow others"
  ON followers FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- 12. FEED_ITEMS TABLE POLICIES
-- ============================================

-- Users can view their own feed items
CREATE POLICY "Users can view own feed items"
  ON feed_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can view feed items from public profiles
CREATE POLICY "Users can view public feed items"
  ON feed_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = feed_items.user_id 
      AND is_private = false
    )
  );

-- Users can view feed items from followed users
CREATE POLICY "Users can view followed users feed items"
  ON feed_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM followers 
      WHERE follower_id = auth.uid() 
      AND following_id = feed_items.user_id
    )
  );

-- Users can insert their own feed items
CREATE POLICY "Users can insert own feed items"
  ON feed_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own feed items
CREATE POLICY "Users can update own feed items"
  ON feed_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own feed items
CREATE POLICY "Users can delete own feed items"
  ON feed_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications (service role)
-- Users can update their own notifications (mark as seen)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 14. SUBSCRIPTIONS TABLE POLICIES
-- ============================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- System can update subscriptions (service role via webhook)

-- ============================================
-- 15. COUPONS TABLE POLICIES
-- ============================================

-- Users can view active coupons
CREATE POLICY "Users can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND valid_until > now());

-- Only admins can manage coupons
CREATE POLICY "Only admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 16. ADMIN_USERS TABLE POLICIES
-- ============================================

-- Only admins can view admin users
CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can manage admin users
CREATE POLICY "Only admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 17. CONFIG TABLE POLICIES
-- ============================================

-- Everyone can view config
CREATE POLICY "Anyone can view config"
  ON config FOR SELECT
  USING (true);

-- Only admins can update config
CREATE POLICY "Only admins can update config"
  ON config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ============================================
-- 18. REPORTS TABLE POLICIES
-- ============================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can insert reports
CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins and moderators can view all reports
CREATE POLICY "Admins and moderators can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Admins and moderators can update reports
CREATE POLICY "Admins and moderators can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Estas políticas asumen que Supabase Auth está correctamente configurado
-- 2. auth.uid() devuelve el ID del usuario autenticado
-- 3. Las operaciones del Service Role bypasean RLS
-- 4. Ejecutar estas políticas DESPUÉS de aplicar las migraciones
-- 5. Probar cada política cuidadosamente antes de ir a producción

