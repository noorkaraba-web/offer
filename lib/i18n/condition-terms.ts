import { CardLang } from "./cards";

/**
 * Translation dictionary for Encar's condition/diagnosis vocabulary — panel
 * names, self-diagnosis checklist groups/items, and status values.
 *
 * Confirmed against two real listings (Chevrolet Bolt EUV, Kia Sportage
 * damaged sample): the structural panel names (`diagnosis` array) and the
 * self-diagnosis checklist (`mechanical` array — group/item/statusKo/ok).
 * Three additional terms are included proactively at the user's explicit
 * request even though not seen in a raw sample yet (EV high-voltage system
 * checks: drive battery isolation, high-voltage wiring, and a Korean-text
 * variant of the radiator-support panel name) — flagged below.
 *
 * Lookups go through `translateTerm`, keyed by the *raw* source string
 * (either an ALL_CAPS enum like `FRONT_FENDER_LEFT`, or the raw Korean text
 * — Encar's data mixes both conventions on the same page). A term with no
 * entry falls back to the raw value and is logged via console.warn, per the
 * user's request to surface gaps instead of silently passing Korean through
 * to a buyer who doesn't read it.
 */

type TermMap = Record<CardLang, string>;

const TERMS: Record<string, TermMap> = {
  // ── Structural panels (confirmed via ALL_CAPS enum names) ──────────────
  front_fender_left: { en: "Front fender (L)", ar: "الرفرف الأمامي (يسار)", ru: "Переднее крыло (лев.)", fr: "Aile avant (G)", es: "Guardabarros delantero (Izq.)" },
  front_fender_right: { en: "Front fender (R)", ar: "الرفرف الأمامي (يمين)", ru: "Переднее крыло (прав.)", fr: "Aile avant (D)", es: "Guardabarros delantero (Der.)" },
  front_door_left: { en: "Front door (L)", ar: "الباب الأمامي (يسار)", ru: "Передняя дверь (лев.)", fr: "Porte avant (G)", es: "Puerta delantera (Izq.)" },
  front_door_right: { en: "Front door (R)", ar: "الباب الأمامي (يمين)", ru: "Передняя дверь (прав.)", fr: "Porte avant (D)", es: "Puerta delantera (Der.)" },
  back_door_left: { en: "Rear door (L)", ar: "الباب الخلفي (يسار)", ru: "Задняя дверь (лев.)", fr: "Porte arrière (G)", es: "Puerta trasera (Izq.)" },
  back_door_right: { en: "Rear door (R)", ar: "الباب الخلفي (يمين)", ru: "Задняя дверь (прав.)", fr: "Porte arrière (D)", es: "Puerta trasera (Der.)" },
  trunk_lid: { en: "Trunk lid", ar: "غطاء الصندوق الخلفي", ru: "Крышка багажника", fr: "Couvercle de coffre", es: "Tapa del maletero" },
  hood: { en: "Hood", ar: "غطاء المحرك", ru: "Капот", fr: "Capot", es: "Capó" },
  roof: { en: "Roof", ar: "السقف", ru: "Крыша", fr: "Toit", es: "Techo" },
  quarter_panel_left: { en: "Quarter panel (L)", ar: "اللوحة الجانبية الخلفية (يسار)", ru: "Заднее крыло (лев.)", fr: "Panneau de custode (G)", es: "Panel trasero lateral (Izq.)" },
  quarter_panel_right: { en: "Quarter panel (R)", ar: "اللوحة الجانبية الخلفية (يمين)", ru: "Заднее крыло (прав.)", fr: "Panneau de custode (D)", es: "Panel trasero lateral (Der.)" },
  side_sill_left: { en: "Side sill (L)", ar: "عتبة الباب الجانبية (يسار)", ru: "Порог (лев.)", fr: "Bas de caisse (G)", es: "Estribo lateral (Izq.)" },
  side_sill_right: { en: "Side sill (R)", ar: "عتبة الباب الجانبية (يمين)", ru: "Порог (прав.)", fr: "Bas de caisse (D)", es: "Estribo lateral (Der.)" },
  pillar_a_left: { en: "A-pillar (L)", ar: "العمود A (يسار)", ru: "Стойка A (лев.)", fr: "Montant A (G)", es: "Pilar A (Izq.)" },
  pillar_a_right: { en: "A-pillar (R)", ar: "العمود A (يمين)", ru: "Стойка A (прав.)", fr: "Montant A (D)", es: "Pilar A (Der.)" },
  pillar_b_left: { en: "B-pillar (L)", ar: "العمود B (يسار)", ru: "Стойка B (лев.)", fr: "Montant B (G)", es: "Pilar B (Izq.)" },
  pillar_b_right: { en: "B-pillar (R)", ar: "العمود B (يمين)", ru: "Стойка B (прав.)", fr: "Montant B (D)", es: "Pilar B (Der.)" },
  pillar_c_left: { en: "C-pillar (L)", ar: "العمود C (يسار)", ru: "Стойка C (лев.)", fr: "Montant C (G)", es: "Pilar C (Izq.)" },
  pillar_c_right: { en: "C-pillar (R)", ar: "العمود C (يمين)", ru: "Стойка C (прав.)", fr: "Montant C (D)", es: "Pilar C (Der.)" },
  radiator_support: { en: "Radiator support", ar: "دعامة الرادياتير", ru: "Опора радиатора", fr: "Support de radiateur", es: "Soporte del radiador" },

  // ── Self-diagnosis groups (Korean-keyed, confirmed via real "mechanical" array) ──
  group_self_diagnosis: { en: "Self-diagnosis", ar: "الفحص الذاتي", ru: "Самодиагностика", fr: "Auto-diagnostic", es: "Autodiagnóstico" },
  group_engine: { en: "Engine", ar: "المحرك", ru: "Двигатель", fr: "Moteur", es: "Motor" },
  group_transmission: { en: "Transmission", ar: "ناقل الحركة", ru: "Коробка передач", fr: "Transmission", es: "Transmisión" },
  group_drivetrain: { en: "Drivetrain", ar: "نقل الحركة", ru: "Трансмиссия", fr: "Groupe motopropulseur", es: "Tren motriz" },
  group_steering: { en: "Steering", ar: "المقود", ru: "Рулевое управление", fr: "Direction", es: "Dirección" },
  group_brakes: { en: "Brakes", ar: "الفرامل", ru: "Тормоза", fr: "Freins", es: "Frenos" },
  group_electrical: { en: "Electrical", ar: "الكهرباء", ru: "Электрика", fr: "Électricité", es: "Eléctrico" },
  group_fuel: { en: "Fuel", ar: "الوقود", ru: "Топливо", fr: "Carburant", es: "Combustible" },
  // Proactive (EV) — not confirmed on a raw sample, added per explicit request.
  group_high_voltage: { en: "High-voltage system", ar: "نظام الجهد العالي", ru: "Высоковольтная система", fr: "Système haute tension", es: "Sistema de alto voltaje" },

  // ── Self-diagnosis items (Korean-keyed, confirmed) ──────────────────────
  item_idle_operation: { en: "Operating condition (idle)", ar: "حالة التشغيل (رالنتي)", ru: "Работа на холостом ходу", fr: "Fonctionnement (ralenti)", es: "Funcionamiento (ralentí)" },
  item_cylinder_cover: { en: "Cylinder cover (rocker arm cover)", ar: "غطاء الأسطوانة (غطاء ذراع الكامة)", ru: "Крышка головки блока (крышка коромысел)", fr: "Cache-culbuteurs", es: "Tapa de cilindros (tapa de balancines)" },
  item_cylinder_head_gasket: { en: "Cylinder head / gasket", ar: "رأس الأسطوانة / الحشية", ru: "Головка блока / прокладка", fr: "Culasse / joint", es: "Culata / junta" },
  item_cylinder_block_oil_pan: { en: "Cylinder block / oil pan", ar: "كتلة الأسطوانات / وعاء الزيت", ru: "Блок цилиндров / масляный поддон", fr: "Bloc-cylindres / carter d'huile", es: "Bloque de cilindros / cárter" },
  item_oil_level: { en: "Oil level", ar: "مستوى الزيت", ru: "Уровень масла", fr: "Niveau d'huile", es: "Nivel de aceite" },
  item_water_pump: { en: "Water pump", ar: "مضخة المياه", ru: "Водяной насос", fr: "Pompe à eau", es: "Bomba de agua" },
  item_radiator: { en: "Radiator", ar: "الرادياتير", ru: "Радиатор", fr: "Radiateur", es: "Radiador" },
  item_coolant_level: { en: "Coolant level", ar: "مستوى سائل التبريد", ru: "Уровень охлаждающей жидкости", fr: "Niveau de liquide de refroidissement", es: "Nivel de refrigerante" },
  item_common_rail: { en: "Common rail", ar: "السكة المشتركة (كومون رايل)", ru: "Common rail", fr: "Rampe commune (common rail)", es: "Riel común (common rail)" },
  item_oil_leak: { en: "Oil leak", ar: "تسريب الزيت", ru: "Утечка масла", fr: "Fuite d'huile", es: "Fuga de aceite" },
  item_cv_joint: { en: "CV joint", ar: "مفصل سرعة ثابتة (CV)", ru: "ШРУС", fr: "Joint homocinétique", es: "Junta homocinética" },
  item_power_steering_leak: { en: "Power steering oil leak", ar: "تسريب زيت المقود المعزز", ru: "Утечка масла ГУР", fr: "Fuite d'huile de direction assistée", es: "Fuga de aceite de dirección asistida" },
  item_steering_gear: { en: "Steering gear (incl. MDPS)", ar: "علبة المقود (بما فيها MDPS)", ru: "Рулевой механизм (вкл. MDPS)", fr: "Boîtier de direction (MDPS inclus)", es: "Caja de dirección (incl. MDPS)" },
  item_steering_joint: { en: "Steering joint", ar: "مفصل عمود المقود", ru: "Рулевой шарнир", fr: "Joint de direction", es: "Junta de dirección" },
  item_tie_rod_ball_joint: { en: "Tie rod end & ball joint", ar: "طرف قضيب التوجيه والمفصل الكروي", ru: "Наконечник рулевой тяги и шаровая опора", fr: "Rotule de direction et rotule de suspension", es: "Terminal de dirección y rótula" },
  item_brake_master_cylinder_leak: { en: "Brake master cylinder oil leak", ar: "تسريب زيت اسطوانة الفرامل الرئيسية", ru: "Утечка масла главного тормозного цилиндра", fr: "Fuite d'huile du maître-cylindre de frein", es: "Fuga de aceite del cilindro maestro de frenos" },
  item_brake_oil_leak: { en: "Brake oil leak", ar: "تسريب زيت الفرامل", ru: "Утечка тормозной жидкости", fr: "Fuite d'huile de frein", es: "Fuga de líquido de frenos" },
  item_brake_booster: { en: "Brake booster", ar: "معزز الفرامل", ru: "Вакуумный усилитель тормозов", fr: "Servofrein", es: "Servofreno" },
  item_alternator_output: { en: "Alternator output", ar: "خرج المولد", ru: "Выход генератора", fr: "Sortie de l'alternateur", es: "Salida del alternador" },
  item_starter_motor: { en: "Starter motor", ar: "محرك بدء التشغيل", ru: "Стартер", fr: "Démarreur", es: "Motor de arranque" },
  item_wiper_motor: { en: "Wiper motor function", ar: "وظيفة محرك المساحات", ru: "Работа мотора стеклоочистителя", fr: "Fonction du moteur d'essuie-glace", es: "Función del motor del limpiaparabrisas" },
  item_blower_motor: { en: "Blower motor", ar: "محرك المروحة الداخلية", ru: "Мотор отопителя салона", fr: "Moteur de soufflerie", es: "Motor del ventilador de climatización" },
  item_radiator_fan_motor: { en: "Radiator fan motor", ar: "محرك مروحة الرادياتير", ru: "Мотор вентилятора радиатора", fr: "Moteur de ventilateur de radiateur", es: "Motor del ventilador del radiador" },
  item_window_motor: { en: "Window motor", ar: "محرك النافذة", ru: "Мотор стеклоподъёмника", fr: "Moteur de lève-vitre", es: "Motor del elevalunas" },
  item_fuel_leak: { en: "Fuel leak (incl. LPG)", ar: "تسريب الوقود (بما فيه الغاز المسال)", ru: "Утечка топлива (вкл. LPG)", fr: "Fuite de carburant (GPL inclus)", es: "Fuga de combustible (incl. GLP)" },
  // Proactive (EV) — exact Korean text provided by the user, not seen on a raw sample.
  item_drive_battery_isolation: { en: "Drive battery isolation", ar: "حالة عزل بطارية الدفع", ru: "Изоляция тяговой батареи", fr: "Isolation de la batterie de traction", es: "Aislamiento de la batería de tracción" },
  item_high_voltage_wiring: { en: "High-voltage wiring (connectors, insulation, protection)", ar: "أسلاك الجهد العالي (الموصلات، العزل، الحماية)", ru: "Высоковольтная проводка (разъёмы, изоляция, защита)", fr: "Câblage haute tension (connecteurs, isolation, protection)", es: "Cableado de alto voltaje (conectores, aislamiento, protección)" },

  // ── Self-diagnosis status values (Korean statusKo, confirmed) ──────────
  status_good: { en: "Good", ar: "جيد", ru: "Хорошо", fr: "Bon", es: "Bueno" },
  status_none: { en: "None", ar: "لا يوجد", ru: "Отсутствует", fr: "Aucune", es: "Ninguna" },
  status_minor_leak: { en: "Minor leak", ar: "تسريب طفيف", ru: "Незначительная утечка", fr: "Fuite mineure", es: "Fuga menor" },
  status_adequate: { en: "Adequate", ar: "مناسب", ru: "Соответствует норме", fr: "Adéquat", es: "Adecuado" },
};

/** Raw source string (Korean text or ALL_CAPS enum) → canonical key above. */
const SOURCE_TO_KEY: Record<string, string> = {
  // Structural panel enums
  FRONT_FENDER_LEFT: "front_fender_left",
  FRONT_FENDER_RIGHT: "front_fender_right",
  FRONT_DOOR_LEFT: "front_door_left",
  FRONT_DOOR_RIGHT: "front_door_right",
  BACK_DOOR_LEFT: "back_door_left",
  BACK_DOOR_RIGHT: "back_door_right",
  TRUNK_LID: "trunk_lid",
  HOOD: "hood",
  ROOF: "roof",
  QUARTER_PANEL_LEFT: "quarter_panel_left",
  QUARTER_PANEL_RIGHT: "quarter_panel_right",
  SIDE_SILL_PANEL_LEFT: "side_sill_left",
  SIDE_SILL_PANEL_RIGHT: "side_sill_right",
  PILLAR_PANEL_A_LEFT: "pillar_a_left",
  PILLAR_PANEL_A_RIGHT: "pillar_a_right",
  PILLAR_PANEL_B_LEFT: "pillar_b_left",
  PILLAR_PANEL_B_RIGHT: "pillar_b_right",
  PILLAR_PANEL_C_LEFT: "pillar_c_left",
  PILLAR_PANEL_C_RIGHT: "pillar_c_right",
  RADIATOR_SUPPORT: "radiator_support",
  RAD_SUPPORT: "radiator_support",
  // Korean-text panel name variant (confirmed to leak through on real listings)
  "라디에이터 서포트(볼트체결부품)": "radiator_support",

  // Self-diagnosis groups
  자기진단: "group_self_diagnosis",
  원동기: "group_engine",
  변속기: "group_transmission",
  동력전달: "group_drivetrain",
  조향: "group_steering",
  제동: "group_brakes",
  전기: "group_electrical",
  연료: "group_fuel",
  고전원전기시스템: "group_high_voltage",

  // Self-diagnosis items
  "작동상태(공회전)": "item_idle_operation",
  "실린더 커버(로커암 커버)": "item_cylinder_cover",
  "실린더 헤드 / 개스킷": "item_cylinder_head_gasket",
  "실린더 블록 / 오일팬": "item_cylinder_block_oil_pan",
  "오일 유량": "item_oil_level",
  워터펌프: "item_water_pump",
  라디에이터: "item_radiator",
  "냉각수 수량": "item_coolant_level",
  커먼레일: "item_common_rail",
  오일누유: "item_oil_leak",
  등속조인트: "item_cv_joint",
  "동력조향 작동 오일 누유": "item_power_steering_leak",
  "스티어링 기어(MDPS포함)": "item_steering_gear",
  스티어링조인트: "item_steering_joint",
  "스티어링 조인트": "item_steering_joint",
  "타이로드엔드 및 볼 조인트": "item_tie_rod_ball_joint",
  "브레이크 마스터 실린더오일 누유": "item_brake_master_cylinder_leak",
  "브레이크 오일 누유": "item_brake_oil_leak",
  "배력장치 상태": "item_brake_booster",
  "발전기 출력": "item_alternator_output",
  "시동 모터": "item_starter_motor",
  "와이퍼 모터 기능": "item_wiper_motor",
  "실내송풍 모터": "item_blower_motor",
  "라디에이터 팬 모터": "item_radiator_fan_motor",
  "윈도우 모터": "item_window_motor",
  "연료누출(LP가스포함)": "item_fuel_leak",
  "구동축전지 격리 상태": "item_drive_battery_isolation",
  "고전원전기배선 상태(접속단자, 피복, 보호기구)": "item_high_voltage_wiring",

  // Self-diagnosis status values
  양호: "status_good",
  없음: "status_none",
  미세누유: "status_minor_leak",
  적정: "status_adequate",
};

const loggedMisses = new Set<string>();

/**
 * Translate a raw source string (Korean text or ALL_CAPS enum) into the
 * given language. Unmapped terms log once via console.warn (per-process,
 * deduped) and fall back to the raw value — so a translation gap is visible
 * in server logs rather than silently shipping Korean to a buyer.
 */
export function translateTerm(lang: CardLang, raw: string): string {
  const key = SOURCE_TO_KEY[raw];
  if (key && TERMS[key]) {
    return TERMS[key][lang] ?? TERMS[key].en;
  }
  if (!loggedMisses.has(raw)) {
    loggedMisses.add(raw);
    console.warn(`[condition-terms] untranslated term, showing raw value: ${JSON.stringify(raw)}`);
  }
  return raw;
}

/** Same lookup, without the raw-string fallback — null when unmapped. */
export function tryTranslateTerm(lang: CardLang, raw: string): string | null {
  const key = SOURCE_TO_KEY[raw];
  if (key && TERMS[key]) return TERMS[key][lang] ?? TERMS[key].en;
  return null;
}
