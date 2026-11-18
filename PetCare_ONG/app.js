const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const state = {
  mode: "login",
  user: null,
  animals: [],
  foods: [],
  plans: [],
  weights: [],
  editing: null
};

const isConfigured = () =>
  window.PETCARE_CONFIG &&
  !PETCARE_CONFIG.SUPABASE_URL.includes("COLE_AQUI") &&
  !PETCARE_CONFIG.SUPABASE_ANON_KEY.includes("COLE_AQUI");

let supabaseClient = null;

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function themeSwal() {
  return document.documentElement.classList.contains("dark") ? "dark" : undefined;
}

async function notify(title, text, icon = "success") {
  await Swal.fire({ title, text, icon, confirmButtonColor: "#820AD1", theme: themeSwal() });
}

function initSupabase() {
  if (!isConfigured()) return false;
  if (!PETCARE_CONFIG.SUPABASE_URL.startsWith("https://") || !PETCARE_CONFIG.SUPABASE_URL.endsWith(".supabase.co")) {
    throw new Error("SUPABASE_URL inválida. Use a Project URL, no formato https://SEU_PROJETO.supabase.co");
  }
  if (PETCARE_CONFIG.SUPABASE_ANON_KEY.startsWith("sb_secret_")) {
    throw new Error("Chave secreta detectada. Use apenas a chave publishable ou anon no frontend.");
  }
  try {
    supabaseClient = window.supabase.createClient(PETCARE_CONFIG.SUPABASE_URL, PETCARE_CONFIG.SUPABASE_ANON_KEY);
    return true;
  } catch (error) {
    throw new Error(`Não foi possível iniciar o Supabase: ${error.message}`);
  }
}

function setAuthMode(mode) {
  state.mode = mode;
  $("#login-tab").classList.toggle("active", mode === "login");
  $("#signup-tab").classList.toggle("active", mode === "signup");
  $("#password").autocomplete = mode === "signup" ? "new-password" : "current-password";
  $("#auth-submit").innerHTML = mode === "login"
    ? '<i data-lucide="log-in"></i> Entrar'
    : '<i data-lucide="user-plus"></i> Criar conta';
  $("#auth-message").textContent = "";
  refreshIcons();
}

async function handleAuth(event) {
  event.preventDefault();
  if (!supabaseClient) {
    $("#auth-message").textContent = "Configure o Supabase em config.js antes de entrar.";
    return;
  }
  const email = $("#email").value.trim();
  const password = $("#password").value;
  if (!email || password.length < 6) {
    $("#auth-message").textContent = "Informe um e-mail válido e uma senha com 6 caracteres.";
    return;
  }
  $("#auth-submit").disabled = true;
  try {
    if (state.mode === "login") {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } else {
      const { error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;
      await notify("Conta criada", "Verifique seu e-mail se a confirmação estiver habilitada.");
    }
  } catch (error) {
    $("#auth-message").textContent = error.message || "Não foi possível concluir a operação.";
  } finally {
    $("#auth-submit").disabled = false;
  }
}

async function loadData() {
  if (!supabaseClient || !state.user) return;
  try {
    const [animalsResult, foodsResult, plansResult, weightsResult] = await Promise.all([
      supabaseClient.from("animals").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("foods").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("feeding_plans").select("*").order("created_at", { ascending: false }),
      supabaseClient.from("weight_records").select("*").order("record_date", { ascending: false })
    ]);
    for (const result of [animalsResult, foodsResult, plansResult, weightsResult]) {
      if (result.error) throw result.error;
    }
    state.animals = animalsResult.data || [];
    state.foods = foodsResult.data || [];
    state.plans = plansResult.data || [];
    state.weights = weightsResult.data || [];
    renderAll();
  } catch (error) {
    await notify("Erro ao carregar", error.message, "error");
  }
}

function showApp(user) {
  state.user = user;
  $("#auth-view").classList.add("hidden");
  $("#app-view").classList.remove("hidden");
  const email = user.email || "Usuário";
  $("#user-avatar").textContent = email[0].toUpperCase();
  $("#user-avatar").title = email;
  loadData();
}

function showAuth() {
  state.user = null;
  $("#app-view").classList.add("hidden");
  $("#auth-view").classList.remove("hidden");
  if (!isConfigured()) $("#auth-message").textContent = "Configure o Supabase em config.js para usar o sistema.";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(value) {
  if (!value) return "Não informado";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(`${value}T12:00:00`));
}

function formatWeight(value) {
  return value == null ? "Não informado" : `${Number(value).toLocaleString("pt-BR")} kg`;
}

function getAnimal(id) {
  return state.animals.find(item => item.id === id);
}

function getFood(id) {
  return state.foods.find(item => item.id === id);
}

function findAlerts() {
  const alerts = [];
  for (const plan of state.plans) {
    if (!plan.active) continue;
    const animal = getAnimal(plan.animal_id);
    const food = getFood(plan.food_id);
    if (!animal || !food) continue;
    const restrictions = (animal.observations || "").toLowerCase();
    const ingredients = (food.ingredients || "").toLowerCase();
    const words = restrictions.split(/[,;.]+|\n/).map(word => word.trim()).filter(word => word.length > 2);
    const matches = words.filter(word => ingredients.includes(word));
    if (matches.length) alerts.push({ animal, food, matches });
  }
  return alerts;
}

function renderAll() {
  renderDashboard();
  renderAnimals();
  renderFoods();
  renderPlans();
  renderWeights();
  refreshIcons();
}

function renderDashboard() {
  const activePlans = state.plans.filter(plan => plan.active).length;
  const alerts = findAlerts();
  $("#stat-animals").textContent = state.animals.length;
  $("#stat-foods").textContent = state.foods.length;
  $("#stat-plans").textContent = activePlans;
  $("#stat-alerts").textContent = alerts.length;

  $("#recent-animals").innerHTML = state.animals.slice(0, 5).length ? state.animals.slice(0, 5).map(animal => `
    <div class="list-row">
      <div class="row-icon"><i data-lucide="dog"></i></div>
      <div class="row-main"><strong>${escapeHtml(animal.name)}</strong><span>${escapeHtml(animal.species)}${animal.breed ? ` • ${escapeHtml(animal.breed)}` : ""}</span></div>
      <div class="row-meta">${escapeHtml(animal.status)}<br>${formatWeight(animal.current_weight)}</div>
    </div>
  `).join("") : '<div class="empty-state"><div><i data-lucide="dog"></i><p>Nenhum animal cadastrado</p></div></div>';

  $("#alerts-list").innerHTML = alerts.length ? alerts.map(({ animal, food, matches }) => `
    <div class="list-row alert-row">
      <div class="row-icon"><i data-lucide="triangle-alert"></i></div>
      <div class="row-main"><strong>${escapeHtml(animal.name)} × ${escapeHtml(food.name)}</strong><span>Possível correspondência: ${escapeHtml(matches.join(", "))}</span></div>
    </div>
  `).join("") : '<div class="empty-state"><div><i data-lucide="shield-check"></i><p>Nenhum alerta identificado</p></div></div>';
}

function renderAnimals() {
  const query = ($("#animal-search").value || "").toLowerCase();
  const items = state.animals.filter(animal =>
    [animal.name, animal.species, animal.breed, animal.status].some(value => (value || "").toLowerCase().includes(query))
  );
  $("#animals-grid").innerHTML = items.length ? items.map(animal => `
    <article class="entity-card">
      <div class="entity-card-header">
        <div><p class="eyebrow">${escapeHtml(animal.species)}</p><h3>${escapeHtml(animal.name)}</h3></div>
        <div class="entity-actions">
          <button class="icon-button" type="button" data-edit="animal" data-id="${animal.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="icon-button" type="button" data-delete="animal" data-id="${animal.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <dl class="detail-list">
        <div><dt>Raça</dt><dd>${escapeHtml(animal.breed || "Não informada")}</dd></div>
        <div><dt>Sexo</dt><dd>${escapeHtml(animal.sex || "Não informado")}</dd></div>
        <div><dt>Nascimento</dt><dd>${formatDate(animal.birth_date)}</dd></div>
        <div><dt>Peso atual</dt><dd>${formatWeight(animal.current_weight)}</dd></div>
        <div><dt>Situação</dt><dd><span class="status-badge ${animal.status === "Adotado" ? "success" : "neutral"}">${escapeHtml(animal.status)}</span></dd></div>
        ${animal.observations ? `<div><dt>Observações</dt><dd>${escapeHtml(animal.observations)}</dd></div>` : ""}
      </dl>
    </article>
  `).join("") : '<div class="empty-state"><div><i data-lucide="dog"></i><p>Nenhum animal encontrado</p></div></div>';
}

function renderFoods() {
  const query = ($("#food-search").value || "").toLowerCase();
  const items = state.foods.filter(food =>
    [food.name, food.brand, food.food_type, food.ingredients].some(value => (value || "").toLowerCase().includes(query))
  );
  $("#foods-grid").innerHTML = items.length ? items.map(food => `
    <article class="entity-card">
      <div class="entity-card-header">
        <div><p class="eyebrow">${escapeHtml(food.food_type)}</p><h3>${escapeHtml(food.name)}</h3></div>
        <div class="entity-actions">
          <button class="icon-button" type="button" data-edit="food" data-id="${food.id}" title="Editar"><i data-lucide="pencil"></i></button>
          <button class="icon-button" type="button" data-delete="food" data-id="${food.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
        </div>
      </div>
      <dl class="detail-list">
        <div><dt>Marca</dt><dd>${escapeHtml(food.brand || "Não informada")}</dd></div>
        <div><dt>Ingredientes</dt><dd>${escapeHtml(food.ingredients || "Não informados")}</dd></div>
        <div><dt>Restrições</dt><dd>${escapeHtml(food.restrictions || "Nenhuma")}</dd></div>
        ${food.observations ? `<div><dt>Observações</dt><dd>${escapeHtml(food.observations)}</dd></div>` : ""}
      </dl>
    </article>
  `).join("") : '<div class="empty-state"><div><i data-lucide="package"></i><p>Nenhum alimento encontrado</p></div></div>';
}

function renderPlans() {
  const filter = $("#plan-filter").value;
  const items = state.plans.filter(plan => filter === "all" || (filter === "active" ? plan.active : !plan.active));
  $("#plans-grid").innerHTML = items.length ? items.map(plan => {
    const animal = getAnimal(plan.animal_id);
    const food = getFood(plan.food_id);
    const perMeal = plan.meals_per_day ? plan.daily_quantity / plan.meals_per_day : 0;
    return `
      <article class="entity-card">
        <div class="entity-card-header">
          <div><p class="eyebrow">${escapeHtml(animal?.species || "Plano")}</p><h3>${escapeHtml(animal?.name || "Animal removido")}</h3></div>
          <div class="entity-actions">
            <button class="icon-button" type="button" data-edit="plan" data-id="${plan.id}" title="Editar"><i data-lucide="pencil"></i></button>
            <button class="icon-button" type="button" data-delete="plan" data-id="${plan.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <dl class="detail-list">
          <div><dt>Alimento</dt><dd>${escapeHtml(food?.name || "Não definido")}</dd></div>
          <div><dt>Quantidade/dia</dt><dd>${Number(plan.daily_quantity).toLocaleString("pt-BR")} g</dd></div>
          <div><dt>Refeições/dia</dt><dd>${plan.meals_per_day}</dd></div>
          <div><dt>Por refeição</dt><dd>${perMeal.toLocaleString("pt-BR", { maximumFractionDigits: 2 })} g</dd></div>
          <div><dt>Horários</dt><dd>${escapeHtml(plan.feeding_times || "Não informados")}</dd></div>
          <div><dt>Situação</dt><dd><span class="status-badge ${plan.active ? "success" : "neutral"}">${plan.active ? "Ativo" : "Inativo"}</span></dd></div>
          ${plan.observations ? `<div><dt>Observações</dt><dd>${escapeHtml(plan.observations)}</dd></div>` : ""}
        </dl>
      </article>
    `;
  }).join("") : '<div class="empty-state"><div><i data-lucide="clipboard-list"></i><p>Nenhum plano encontrado</p></div></div>';
}

function renderWeights() {
  const filter = $("#weight-filter").value;
  const items = state.weights.filter(record => filter === "all" || record.animal_id === filter);
  $("#weights-grid").innerHTML = items.length ? items.map(record => {
    const animal = getAnimal(record.animal_id);
    return `
      <article class="entity-card">
        <div class="entity-card-header">
          <div><p class="eyebrow">${formatDate(record.record_date)}</p><h3>${escapeHtml(animal?.name || "Animal removido")}</h3></div>
          <div class="entity-actions">
            <button class="icon-button" type="button" data-edit="weight" data-id="${record.id}" title="Editar"><i data-lucide="pencil"></i></button>
            <button class="icon-button" type="button" data-delete="weight" data-id="${record.id}" title="Excluir"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <dl class="detail-list"><div><dt>Peso</dt><dd>${formatWeight(record.weight)}</dd></div>${record.observations ? `<div><dt>Observações</dt><dd>${escapeHtml(record.observations)}</dd></div>` : ""}</dl>
      </article>
    `;
  }).join("") : '<div class="empty-state"><div><i data-lucide="scale"></i><p>Nenhum registro de peso encontrado</p></div></div>';
  updateWeightFilter();
}

function updateWeightFilter() {
  const select = $("#weight-filter");
  const current = select.value;
  select.innerHTML = '<option value="all">Todos os animais</option>' + state.animals.map(animal =>
    `<option value="${animal.id}"${current === animal.id ? " selected" : ""}>${escapeHtml(animal.name)}</option>`
  ).join("");
}

function openDialog(type, record = null) {
  state.editing = record ? { type, id: record.id } : { type, id: null };
  const titles = {
    animal: ["Animal", record ? "Editar animal" : "Novo animal"],
    food: ["Alimento", record ? "Editar alimento" : "Novo alimento"],
    plan: ["Plano alimentar", record ? "Editar plano" : "Novo plano"],
    weight: ["Histórico de peso", record ? "Editar pesagem" : "Registrar peso"]
  };
  $("#dialog-kicker").textContent = titles[type][0];
  $("#dialog-title").textContent = titles[type][1];
  $("#dialog-fields").innerHTML = getFields(type, record);
  $("#crud-dialog").showModal();
  refreshIcons();
  const firstField = $("#dialog-fields input, #dialog-fields select, #dialog-fields textarea");
  if (firstField) firstField.focus();
}

function field(name, label, value = "", options = {}) {
  const type = options.type || "text";
  const required = options.required ? "required" : "";
  const full = options.full ? "full" : "";
  if (options.select) return `<div class="field ${full}"><label for="${name}">${label}</label><select id="${name}" name="${name}" ${required}>${options.select}</select></div>`;
  if (options.textarea) return `<div class="field ${full}"><label for="${name}">${label}</label><textarea id="${name}" name="${name}" ${required}>${escapeHtml(value)}</textarea></div>`;
  const min = options.min != null ? `min="${options.min}"` : "";
  const max = options.max != null ? `max="${options.max}"` : "";
  const step = options.step ? `step="${options.step}"` : "";
  return `<div class="field ${full}"><label for="${name}">${label}</label><input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${required} ${min} ${max} ${step}></div>`;
}

function getFields(type, record = null) {
  if (type === "animal") {
    return `
      ${field("name", "Nome", record?.name, { required: true, full: true })}
      ${field("species", "Espécie", record?.species, { required: true })}
      ${field("breed", "Raça", record?.breed)}
      ${field("sex", "Sexo", "", { select: '<option value="">Não informado</option><option value="Macho"'+(record?.sex === "Macho" ? " selected" : "")+'>Macho</option><option value="Fêmea"'+(record?.sex === "Fêmea" ? " selected" : "")+'>Fêmea</option>' })}
      ${field("birth_date", "Data de nascimento", record?.birth_date, { type: "date", max: new Date().toISOString().slice(0, 10) })}
      ${field("current_weight", "Peso atual (kg)", record?.current_weight, { type: "number", min: "0.01", step: "0.01" })}
      ${field("status", "Situação", "", { required: true, select: ["Disponível","Em tratamento","Adotado","Lar temporário"].map(v => `<option value="${v}"${record?.status === v || (!record && v === "Disponível") ? " selected" : ""}>${v}</option>`).join("") })}
      ${field("observations", "Observações e restrições", record?.observations, { textarea: true, full: true })}
    `;
  }
  if (type === "food") {
    return `
      ${field("name", "Nome do alimento", record?.name, { required: true })}
      ${field("brand", "Marca", record?.brand)}
      ${field("food_type", "Tipo de alimento", record?.food_type, { required: true })}
      ${field("restrictions", "Restrições", record?.restrictions)}
      ${field("ingredients", "Ingredientes", record?.ingredients, { textarea: true, full: true })}
      ${field("observations", "Observações", record?.observations, { textarea: true, full: true })}
    `;
  }
  if (type === "plan") {
    const animalOptions = state.animals.map(animal => `<option value="${animal.id}"${record?.animal_id === animal.id ? " selected" : ""}>${escapeHtml(animal.name)}</option>`).join("");
    const foodOptions = '<option value="">Sem alimento definido</option>' + state.foods.map(food => `<option value="${food.id}"${record?.food_id === food.id ? " selected" : ""}>${escapeHtml(food.name)}</option>`).join("");
    return `
      ${field("animal_id", "Animal", "", { required: true, select: animalOptions })}
      ${field("food_id", "Alimento", "", { select: foodOptions })}
      ${field("daily_quantity", "Quantidade diária (g)", record?.daily_quantity, { type: "number", required: true, min: "0.01", step: "0.01" })}
      ${field("meals_per_day", "Refeições por dia", record?.meals_per_day, { type: "number", required: true, min: "1", step: "1" })}
      ${field("feeding_times", "Horários das refeições", record?.feeding_times)}
      ${field("active", "Situação", "", { select: '<option value="true"'+(record?.active !== false ? " selected" : "")+'>Ativo</option><option value="false"'+(record?.active === false ? " selected" : "")+'>Inativo</option>' })}
      ${field("observations", "Observações", record?.observations, { textarea: true, full: true })}
    `;
  }
  return `
    ${field("animal_id", "Animal", "", { required: true, select: state.animals.map(animal => `<option value="${animal.id}"${record?.animal_id === animal.id ? " selected" : ""}>${escapeHtml(animal.name)}</option>`).join("") })}
    ${field("weight", "Peso (kg)", record?.weight, { type: "number", required: true, min: "0.01", step: "0.01" })}
    ${field("record_date", "Data da pesagem", record?.record_date || new Date().toLocaleDateString("en-CA"), { type: "date", required: true, max: new Date().toISOString().slice(0, 10) })}
    ${field("observations", "Observações", record?.observations, { textarea: true, full: true })}
  `;
}

async function submitCrud(event) {
  event.preventDefault();
  if (!state.editing) return;
  const values = Object.fromEntries(new FormData($("#crud-form")).entries());
  const type = state.editing.type;
  let payload;
  if (type === "animal") {
    payload = { name: values.name.trim(), species: values.species.trim(), breed: values.breed.trim() || null, sex: values.sex || null, birth_date: values.birth_date || null, current_weight: values.current_weight ? Number(values.current_weight) : null, status: values.status, observations: values.observations.trim() || null };
  } else if (type === "food") {
    payload = { name: values.name.trim(), brand: values.brand.trim() || null, food_type: values.food_type.trim(), ingredients: values.ingredients.trim() || null, restrictions: values.restrictions.trim() || null, observations: values.observations.trim() || null };
  } else if (type === "plan") {
    payload = { animal_id: values.animal_id, food_id: values.food_id || null, daily_quantity: Number(values.daily_quantity), meals_per_day: Number(values.meals_per_day), feeding_times: values.feeding_times.trim() || null, active: values.active === "true", observations: values.observations.trim() || null };
  } else {
    payload = { animal_id: values.animal_id, weight: Number(values.weight), record_date: values.record_date, observations: values.observations.trim() || null };
  }
  const table = { animal: "animals", food: "foods", plan: "feeding_plans", weight: "weight_records" }[type];
  payload.user_id = state.user.id;
  try {
    const result = state.editing.id
      ? await supabaseClient.from(table).update(payload).eq("id", state.editing.id).eq("user_id", state.user.id)
      : await supabaseClient.from(table).insert(payload);
    if (result.error) throw result.error;
    $("#crud-dialog").close();
    await loadData();
  } catch (error) {
    await notify("Erro ao salvar", error.message, "error");
  }
}

async function deleteRecord(type, id) {
  const names = { animal: "animal", food: "alimento", plan: "plano alimentar", weight: "registro de peso" };
  const result = await Swal.fire({
    title: `Excluir ${names[type]}?`,
    text: "Esta ação não poderá ser desfeita.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Excluir",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#DC2626",
    theme: themeSwal()
  });
  if (!result.isConfirmed) return;
  const table = { animal: "animals", food: "foods", plan: "feeding_plans", weight: "weight_records" }[type];
  try {
    const { error } = await supabaseClient.from(table).delete().eq("id", id).eq("user_id", state.user.id);
    if (error) throw error;
    await loadData();
  } catch (error) {
    await notify("Erro ao excluir", error.message, "error");
  }
}

function navigate(page) {
  $$(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.page === page));
  $$(".page").forEach(section => section.classList.remove("active"));
  $(`#${page}-page`)?.classList.add("active");
  const titles = { dashboard: ["Visão geral", "Painel"], animals: ["Cadastro", "Animais"], foods: ["Alimentos", "Alimentos"], plans: ["Acompanhamento", "Planos alimentares"], weights: ["Histórico", "Registro de peso"] };
  $("#page-kicker").textContent = titles[page][0];
  $("#page-title").textContent = titles[page][1];
  $(".sidebar").classList.remove("open");
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const dark = document.documentElement.classList.contains("dark");
  localStorage.setItem("petcare-theme", dark ? "dark" : "light");
  $("#theme-toggle").innerHTML = `<i data-lucide="${dark ? "sun" : "moon"}"></i>`;
  refreshIcons();
}

function bindEvents() {
  $("#login-tab").addEventListener("click", () => setAuthMode("login"));
  $("#signup-tab").addEventListener("click", () => setAuthMode("signup"));
  $("#auth-form").addEventListener("submit", handleAuth);
  $("#logout-button").addEventListener("click", async () => { if (supabaseClient) await supabaseClient.auth.signOut(); });
  $("#theme-toggle").addEventListener("click", toggleTheme);
  $("#menu-toggle").addEventListener("click", () => $(".sidebar").classList.toggle("open"));
  $$(".nav-item").forEach(item => item.addEventListener("click", () => navigate(item.dataset.page)));
  $$("[data-go]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.go)));
  $$("[data-add]").forEach(button => button.addEventListener("click", () => {
    const type = button.dataset.add;
    if ((type === "plan" || type === "weight") && !state.animals.length) {
      notify(type === "plan" ? "Cadastre um animal" : "Cadastre um animal", "É necessário ter pelo menos um animal para continuar.", "warning");
      return;
    }
    openDialog(type);
  }));
  $("#animal-search").addEventListener("input", renderAnimals);
  $("#food-search").addEventListener("input", renderFoods);
  $("#plan-filter").addEventListener("change", renderPlans);
  $("#weight-filter").addEventListener("change", renderWeights);
  $("#dialog-close").addEventListener("click", () => $("#crud-dialog").close());
  $("#dialog-cancel").addEventListener("click", () => $("#crud-dialog").close());
  $("#crud-form").addEventListener("submit", submitCrud);
  document.addEventListener("click", event => {
    const edit = event.target.closest("[data-edit]");
    if (edit) {
      const type = edit.dataset.edit;
      const table = { animal: "animals", food: "foods", plan: "plans", weight: "weights" }[type];
      const record = state[table].find(item => item.id === edit.dataset.id);
      if (record) openDialog(type, record);
      return;
    }
    const remove = event.target.closest("[data-delete]");
    if (remove) deleteRecord(remove.dataset.delete, remove.dataset.id);
  });
}

async function start() {
  bindEvents();
  if (document.documentElement.classList.contains("dark")) $("#theme-toggle").innerHTML = '<i data-lucide="sun"></i>';
  refreshIcons();
  try {
    if (!initSupabase()) {
      showAuth();
      return;
    }
  } catch (error) {
    showAuth();
    $("#auth-message").textContent = error.message;
    return;
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) showApp(session.user);
  else showAuth();
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    if (session) showApp(session.user);
    else showAuth();
  });
}

start();
