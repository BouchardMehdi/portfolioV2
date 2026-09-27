import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/contact/route";

const message = {
  name: "Camille Martin",
  email: "camille@example.com",
  subject: "Un projet web",
  message: "Bonjour, je souhaite échanger au sujet de votre travail.",
  website: "",
};

function request(body: unknown = message, origin = "http://localhost:3000") {
  return new Request("http://localhost:3000/api/contact", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("le formulaire valide, protège et transmet les messages côté serveur", async (t) => {
  const variables = [
    "BREVO_API_KEY",
    "BREVO_SENDER_EMAIL",
    "CONTACT_RECIPIENT_EMAIL",
    "CONTACT_ORIGIN",
  ] as const;
  const previous = variables.map((key) => process.env[key]);
  t.after(() =>
    variables.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    }),
  );
  process.env.BREVO_API_KEY = "test-key";
  process.env.BREVO_SENDER_EMAIL = "portfolio@example.com";
  process.env.CONTACT_RECIPIENT_EMAIL = "owner@example.com";
  process.env.CONTACT_ORIGIN = "http://localhost:3000";
  const send = t.mock.method(
    globalThis,
    "fetch",
    async () => new Response("{}", { status: 201 }),
  );

  await t.test(
    "refuse une origine étrangère sans contacter Brevo",
    async () => {
      assert.equal(
        (await POST(request(message, "https://elsewhere.example"))).status,
        403,
      );
      assert.equal(send.mock.callCount(), 0);
    },
  );
  await t.test(
    "refuse les champs invalides, le piège et les corps excessifs",
    async () => {
      for (const body of [
        { ...message, email: "incorrect" },
        { ...message, website: "spam" },
        { ...message, subject: "Bonjour\nBcc: spam" },
      ]) {
        assert.equal((await POST(request(body))).status, 400);
      }
      assert.equal(
        (await POST(request({ ...message, message: "x".repeat(25000) })))
          .status,
        413,
      );
      assert.equal(send.mock.callCount(), 0);
    },
  );
  await t.test("refuse le JSON malformé et les autres formats", async () => {
    const malformed = request();
    assert.equal(
      (
        await POST(
          new Request(malformed.url, {
            method: "POST",
            headers: malformed.headers,
            body: "{",
          }),
        )
      ).status,
      400,
    );
    const wrongFormat = request();
    wrongFormat.headers.set("content-type", "text/plain");
    assert.equal((await POST(wrongFormat)).status, 415);
    assert.equal(send.mock.callCount(), 0);
  });
  await t.test(
    "signale une configuration absente sans faux succès",
    async () => {
      delete process.env.BREVO_API_KEY;
      assert.equal((await POST(request())).status, 503);
      assert.equal(send.mock.callCount(), 0);
      process.env.BREVO_API_KEY = "test-key";
    },
  );
  await t.test(
    "envoie au destinataire configuré avec le visiteur en replyTo",
    async () => {
      assert.equal(
        (await POST(request({ ...message, to: "intruder@example.com" })))
          .status,
        200,
      );
      const call = send.mock.calls[0].arguments as unknown as [
        string,
        RequestInit,
      ];
      assert.equal(call[0], "https://api.brevo.com/v3/smtp/email");
      const body = JSON.parse(String(call[1].body));
      assert.deepEqual(body.to, [{ email: "owner@example.com" }]);
      assert.equal(body.sender.email, "portfolio@example.com");
      assert.equal(body.replyTo.email, message.email);
      assert.ok(body.textContent.includes(message.message));
      assert.equal(body.htmlContent, undefined);
    },
  );
  await t.test("limite les tentatives répétées", async () => {
    const body = { ...message, email: "repeat@example.com" };
    for (let i = 0; i < 3; i++)
      assert.equal((await POST(request(body))).status, 200);
    const calls = send.mock.callCount();
    const response = await POST(request(body));
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "900");
    assert.equal(send.mock.callCount(), calls);
  });
  await t.test("ne révèle pas les erreurs du prestataire", async () => {
    send.mock.mockImplementation(
      async () => new Response("provider-secret", { status: 401 }),
    );
    const response = await POST(
      request({ ...message, email: "failure@example.com" }),
    );
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes("provider-secret"));
  });
  await t.test("gère un échec réseau sans confirmer l’envoi", async () => {
    send.mock.mockImplementation(async () => {
      throw new Error("network");
    });
    assert.equal(
      (await POST(request({ ...message, email: "network@example.com" })))
        .status,
      502,
    );
  });
});
