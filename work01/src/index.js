export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理 CORS 预检（其实同域访问不一定需要，但加上更通用）
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    // 1) 接收表单提交
    if (url.pathname === "/api/submit" && request.method === "POST") {
      let body;
      try {
        body = await request.json();
      } catch (e) {
        return new Response("Invalid JSON", { status: 400 });
      }

      try {
        await env.DB.prepare(
          "INSERT INTO submissions (data) VALUES (?)"
        )
          .bind(JSON.stringify(body))
          .run();
      } catch (e) {
        console.error("DB insert error:", e);
        return new Response("DB error", { status: 500 });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 2) 后台查看接口：GET /api/submissions 返回最近 100 条
    if (url.pathname === "/api/submissions" && request.method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT id, created_at, data FROM submissions ORDER BY id DESC LIMIT 100;"
      ).all();

      return new Response(JSON.stringify(results, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 3) 其余请求 → 静态资源（index.html, js, css 等）
    return env.ASSETS.fetch(request);
  }
};