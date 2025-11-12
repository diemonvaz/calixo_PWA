-- ============================================
-- Calixo PWA - Aplicar Políticas RLS
-- Ejecutar después de crear tablas
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS
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
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. USERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own user data" ON users;
CREATE POLICY "Users can view own user data"
  ON users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own user data" ON users;
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. PROFILES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public profiles" ON profiles;
CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (is_private = false);

DROP POLICY IF EXISTS "Users can view followed private profiles" ON profiles;
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

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. CHALLENGES TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active challenges" ON challenges;
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can insert challenges" ON challenges;
CREATE POLICY "Only admins can insert challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Only admins can update challenges" ON challenges;
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

DROP POLICY IF EXISTS "Users can view own challenges" ON user_challenges;
CREATE POLICY "Users can view own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own challenges" ON user_challenges;
CREATE POLICY "Users can insert own challenges"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenges" ON user_challenges;
CREATE POLICY "Users can update own challenges"
  ON user_challenges FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. FOCUS_SESSIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own focus sessions" ON focus_sessions;
CREATE POLICY "Users can view own focus sessions"
  ON focus_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_challenges 
      WHERE id = user_challenge_id 
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own focus sessions" ON focus_sessions;
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

DROP POLICY IF EXISTS "Users can view own social sessions" ON social_sessions;
CREATE POLICY "Users can view own social sessions"
  ON social_sessions FOR SELECT
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "Users can create social sessions" ON social_sessions;
CREATE POLICY "Users can create social sessions"
  ON social_sessions FOR INSERT
  WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "Users can update own social sessions" ON social_sessions;
CREATE POLICY "Users can update own social sessions"
  ON social_sessions FOR UPDATE
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

-- ============================================
-- 8. AVATAR_CUSTOMIZATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own customizations" ON avatar_customizations;
CREATE POLICY "Users can view own customizations"
  ON avatar_customizations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own customizations" ON avatar_customizations;
CREATE POLICY "Users can insert own customizations"
  ON avatar_customizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own customizations" ON avatar_customizations;
CREATE POLICY "Users can update own customizations"
  ON avatar_customizations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own customizations" ON avatar_customizations;
CREATE POLICY "Users can delete own customizations"
  ON avatar_customizations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. STORE_ITEMS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active store items" ON store_items;
CREATE POLICY "Anyone can view active store items"
  ON store_items FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Only admins can manage store items" ON store_items;
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

DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. FOLLOWERS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own followers" ON followers;
CREATE POLICY "Users can view own followers"
  ON followers FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

DROP POLICY IF EXISTS "Users can follow others" ON followers;
CREATE POLICY "Users can follow others"
  ON followers FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow others" ON followers;
CREATE POLICY "Users can unfollow others"
  ON followers FOR DELETE
  USING (auth.uid() = follower_id);

-- ============================================
-- 12. FEED_ITEMS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own feed items" ON feed_items;
CREATE POLICY "Users can view own feed items"
  ON feed_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public feed items" ON feed_items;
CREATE POLICY "Users can view public feed items"
  ON feed_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = feed_items.user_id 
      AND is_private = false
    )
  );

DROP POLICY IF EXISTS "Users can view followed users feed items" ON feed_items;
CREATE POLICY "Users can view followed users feed items"
  ON feed_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM followers 
      WHERE follower_id = auth.uid() 
      AND following_id = feed_items.user_id
    )
  );

DROP POLICY IF EXISTS "Users can insert own feed items" ON feed_items;
CREATE POLICY "Users can insert own feed items"
  ON feed_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own feed items" ON feed_items;
CREATE POLICY "Users can update own feed items"
  ON feed_items FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own feed items" ON feed_items;
CREATE POLICY "Users can delete own feed items"
  ON feed_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. NOTIFICATIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 14. SUBSCRIPTIONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON subscriptions;
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 15. COUPONS TABLE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view active coupons" ON coupons;
CREATE POLICY "Users can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND valid_until > now());

DROP POLICY IF EXISTS "Only admins can manage coupons" ON coupons;
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

DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;
CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only admins can manage admin users" ON admin_users;
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

DROP POLICY IF EXISTS "Anyone can view config" ON config;
CREATE POLICY "Anyone can view config"
  ON config FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Only admins can update config" ON config;
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

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Users can insert reports" ON reports;
CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "Admins and moderators can view all reports" ON reports;
CREATE POLICY "Admins and moderators can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins and moderators can update reports" ON reports;
CREATE POLICY "Admins and moderators can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 19. CONTACTS TABLE POLICIES
-- ============================================

-- Anyone can insert contacts (for newsletter signup)
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
CREATE POLICY "Anyone can insert contacts"
  ON contacts FOR INSERT
  WITH CHECK (true);

-- Only admins can view contacts
DROP POLICY IF EXISTS "Only admins can view contacts" ON contacts;
CREATE POLICY "Only admins can view contacts"
  ON contacts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Only admins can update contacts
DROP POLICY IF EXISTS "Only admins can update contacts" ON contacts;
CREATE POLICY "Only admins can update contacts"
  ON contacts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

