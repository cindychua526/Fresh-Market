// 小镇鲜市 · 站点配置
//
// 有两种填法，选一种就行：
//
// 【做法一：直接填在这里】适合拖拽上传，或者不介意 key 出现在 GitHub 上。
//   在下面两个双引号里填好 Supabase 的 Project URL 和 anon / publishable key。
//   anon / publishable key 本来就是公开给网页用的；存档安全靠 schema.sql 里的数据库规则保护。
//   ⚠️ 千万不要填 service_role / secret key！
//
// 【做法二：交给 Netlify 自动生成】适合 GitHub + Netlify，GitHub 上不放 key。
//   这个文件保持空白即可。在 Netlify 后台
//   Site configuration → Environment variables 里添加：
//     SUPABASE_URL       = 你的 Project URL
//     SUPABASE_ANON_KEY  = 你的 anon / publishable key
//   Netlify 每次发布时会自动生成这个文件（见 netlify.toml）。
//
// 两个都留空也能玩单机，只是没有云存档、排行榜和联机。
window.FM_CONFIG = {
  supabaseUrl: "",      // 例如 "https://abcdxyz.supabase.co"
  supabaseAnonKey: ""   // 例如 "eyJhbGciOi..." 或 "sb_publishable_..."
};
