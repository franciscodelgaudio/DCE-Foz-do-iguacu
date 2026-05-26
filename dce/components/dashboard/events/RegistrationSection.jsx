'use client'

import { useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

const FIELD_TYPES = [
    { value: "text", label: "Texto curto" },
    { value: "textarea", label: "Texto longo" },
    { value: "email", label: "E-mail" },
    { value: "tel", label: "Telefone" },
    { value: "number", label: "Número" },
    { value: "select", label: "Seleção (lista)" },
    { value: "checkbox", label: "Checkbox (sim/não)" },
]

const PIX_TYPE_OPTIONS = [
    { value: "email", label: "E-mail" },
    { value: "phone", label: "Telefone / WhatsApp" },
    { value: "cpf", label: "CPF / CNPJ" },
    { value: "random", label: "Chave Aleatória" },
]

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={[
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                checked ? "bg-[#2708ab]" : "bg-slate-200",
            ].join(" ")}
        >
            <span
                className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    checked ? "translate-x-6" : "translate-x-1",
                ].join(" ")}
            />
        </button>
    )
}

export function RegistrationSection({ control, register, watch, setValue, errors }) {
    const { fields, append, remove, swap } = useFieldArray({
        control,
        name: "registration.formFields",
    })

    const registrationEnabled = watch("registration.enabled")
    const requiresPayment = watch("registration.requiresPayment")

    function addField() {
        append({
            key: `field_${Date.now()}`,
            label: "",
            type: "text",
            required: false,
            optionsText: "",
        })
    }

    return (
        <div className="rounded-xl border bg-white">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <p className="font-semibold text-slate-800">Inscrições</p>
                    <p className="text-xs text-slate-500">Habilite para permitir que pessoas se inscrevam neste evento</p>
                </div>
                <Toggle
                    checked={registrationEnabled ?? false}
                    onChange={(v) => setValue("registration.enabled", v)}
                />
            </div>

            {registrationEnabled && (
                <div className="border-t px-5 py-5 space-y-6">
                    {/* Prazo e Limite */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Prazo de inscrição (opcional)</Label>
                            <Input type="datetime-local" {...register("registration.deadline")} />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Limite de vagas (opcional)</Label>
                            <Input
                                type="number"
                                min={1}
                                placeholder="Sem limite"
                                {...register("registration.limit")}
                            />
                        </div>
                    </div>

                    {/* Pagamento */}
                    <div className="rounded-lg border p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">Requer pagamento</p>
                                <p className="text-xs text-slate-500">Inscrições ficam com status "aguardando" até você confirmar</p>
                            </div>
                            <Toggle
                                checked={requiresPayment ?? false}
                                onChange={(v) => setValue("registration.requiresPayment", v)}
                            />
                        </div>

                        {requiresPayment && (
                            <div className="space-y-3 pt-1">
                                <div className="space-y-1.5">
                                    <Label>Valor (R$)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="0,00"
                                        {...register("registration.paymentAmount")}
                                    />
                                </div>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label>Tipo da chave PIX</Label>
                                        <select
                                            {...register("registration.pixKeyType")}
                                            className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                        >
                                            {PIX_TYPE_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label>Chave PIX</Label>
                                        <Input
                                            placeholder="Ex: dce@exemplo.com"
                                            {...register("registration.pixKey")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Nome do favorecido</Label>
                                    <Input
                                        placeholder="Ex: DCE UNIOESTE Foz"
                                        {...register("registration.pixRecipientName")}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Campos do formulário */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-800">Campos do formulário</p>
                                <p className="text-xs text-slate-500">Defina quais informações serão coletadas na inscrição</p>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={addField}>
                                <Plus className="size-4" />
                                Adicionar campo
                            </Button>
                        </div>

                        {fields.length === 0 && (
                            <p className="rounded-lg border border-dashed py-6 text-center text-sm text-slate-400">
                                Nenhum campo adicionado. Clique em "Adicionar campo" para começar.
                            </p>
                        )}

                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <FieldRow
                                    key={field.id}
                                    index={index}
                                    total={fields.length}
                                    register={register}
                                    watch={watch}
                                    setValue={setValue}
                                    errors={errors}
                                    onRemove={() => remove(index)}
                                    onMoveUp={() => index > 0 && swap(index, index - 1)}
                                    onMoveDown={() => index < fields.length - 1 && swap(index, index + 1)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function FieldRow({ index, total, register, watch, setValue, errors, onRemove, onMoveUp, onMoveDown }) {
    const fieldType = watch(`registration.formFields.${index}.type`)
    const isRequired = watch(`registration.formFields.${index}.required`)
    const labelError = errors?.registration?.formFields?.[index]?.label

    return (
        <div className="rounded-lg border bg-slate-50 p-3 space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={index === 0}
                        className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                        <ChevronUp className="size-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={index === total - 1}
                        className="rounded p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    >
                        <ChevronDown className="size-3.5" />
                    </button>
                </div>

                <Input
                    placeholder="Nome do campo (ex: Nome completo)"
                    className={["flex-1 bg-white", labelError ? "border-red-400 focus-visible:ring-red-400" : ""].join(" ")}
                    {...register(`registration.formFields.${index}.label`, { required: 'Nome do campo é obrigatório' })}
                />

                <select
                    {...register(`registration.formFields.${index}.type`)}
                    className="h-9 rounded-md border border-input bg-white px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    {FIELD_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500">Obrigatório</span>
                    <Toggle
                        checked={isRequired ?? false}
                        onChange={(v) => setValue(`registration.formFields.${index}.required`, v)}
                    />
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                >
                    <Trash2 className="size-4" />
                </button>
            </div>

            {labelError && (
                <p className="pl-8 text-xs text-red-500">{labelError.message}</p>
            )}

            {fieldType === "select" && (
                <div className="pl-8 space-y-1">
                    <p className="text-xs text-slate-500">Opções separadas por vírgula</p>
                    <Input
                        placeholder="Ex: Opção 1, Opção 2, Opção 3"
                        className="bg-white text-sm"
                        {...register(`registration.formFields.${index}.optionsText`)}
                    />
                </div>
            )}
        </div>
    )
}
