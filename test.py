import math

# Входные данные
layers = [
    [0.44, 1.90, 1675, 2300, 0.03, 0, "Цементобетон Btb4,8"],
    [0.20, 1.90, 1675, 2300, 0.03, 0, "Цементобетон B10"],
    [0.30, 1.90, 1675, 2300, 0.03, 0, "Цементобетон сущ"],
    [0.20, 1.90, 1675, 2300, 0.03, 0, "Цементобетон сущ"],
    [0.20, 1.80, 1840, 2000, 0.05, 0, "Пескобетон сущ"],
    [" - ", 1.50, 2135, 1640, 0.21, 0.18, "Глина полутвердая (грунт)"]
]

# Базовые параметры
theta_mp = 12.51    # Средняя температура для конструкционных слоев
tau_f = 3624        # Продолжительность промерзания, часов
L = 334             # Теплота фазового перехода
t0 = 1.5            # Начальная температура грунта (для глины полутвердой)

# Параметры грунта (последний слой)
lambda_f_soil = 1.50
Cf_soil = 2135
pd_soil = 1640
w_soil = 0.21
wp_soil = 0.18
kw = 0.65
ww_soil = kw * wp_soil  # = 0.65 * 0.18 = 0.117

print(f"ww_soil = {ww_soil:.3f}")

# Расчёт η для каждого слоя
eta_f_values = []        # eta_f для каждого слоя
eta_f_i_values = []      # eta_f_i для каждого слоя
lambda_f_values = []     # lambda_f для каждого слоя

for i, layer in enumerate(layers):
    thickness, lambda_f, Cf, pd, w, wp, name = layer[:7]
    
    # Для грунта (последний слой)
    if thickness == " - ":
        # eta_f_i для грунта (используется в сумматоре)
        eta_f_i = 0.5 * theta_mp * Cf_soil + pd_soil * (w_soil - ww_soil) * L
        # eta_f_0 для грунта (используется в основной формуле)
        eta_f_0 = 0.5 * t0 * Cf_soil + pd_soil * (w_soil - ww_soil) * L
        
        lambda_f_values.append(lambda_f_soil)
        eta_f_values.append(eta_f_i)      # eta_f для грунта = eta_f_i
        eta_f_i_values.append(eta_f_0)    # eta_f_i для грунта = eta_f_0
        
        print(f"Глина: eta_f_i = {eta_f_i:.1f}, eta_f_0 = {eta_f_0:.1f}")
    
    # Для конструкционных слоев
    else:
        ww = 0  # по условию для конструкционных слоев
        eta_f = 0.5 * theta_mp * Cf + pd * (w - ww) * L
        
        lambda_f_values.append(lambda_f)
        eta_f_values.append(eta_f)
        eta_f_i_values.append(eta_f)  # для конструкций eta_f_i = eta_f

# Печать η для контроля
print("\neta_f для слоёв:")
for i, (eta, layer) in enumerate(zip(eta_f_values, layers)):
    print(f"{i+1}. {layer[-1]}: {eta:.1f}")

# Расчёт суммы Σ = толщина * sqrt((lambda_f_грунта * eta_f_слоя) / (lambda_f_слоя * eta_f_грунта))
# В Excel: =B7*SQRT(($C$12*H7)/(C7*$H$12))
lambda_f_grunt = lambda_f_soil
eta_f_grunt = eta_f_values[-1]  # eta_f для грунта

sum_sigma = 0.0
sigmas = []

print(f"\nРасчет суммы Σ:")
print(f"lambda_f_grunt = {lambda_f_grunt}")
print(f"eta_f_grunt = {eta_f_grunt:.1f}")

for i in range(len(layers) - 1):  # только конструкционные слои (первые 5)
    thickness = layers[i][0]
    lambda_f_i = lambda_f_values[i]
    eta_f_i = eta_f_values[i]   # eta_f для i-го слоя
    
    # Формула из Excel: =B7*SQRT(($C$12*H7)/(C7*$H$12))
    term = thickness * math.sqrt((lambda_f_grunt * eta_f_i) / (lambda_f_i * eta_f_grunt))
    sigmas.append(term)
    sum_sigma += term
    
    print(f"Слой {i+1}: толщина = {thickness}, lambda_f_i = {lambda_f_i}, eta_f_i = {eta_f_i:.1f}, term = {term:.3f}")

print("\nЗначения Σ по слоям:")
for i, s in enumerate(sigmas):
    print(f"{i+1}. {s:.3f}")

print(f"\nСумма Σ = {sum_sigma:.3f} (ожидается 0.884)")

# Расчёт Hn
# Формула из Excel: =1.9*SQRT(2*C12*E28)*(SQRT(E29/H12)-SQRT(E25/E26))-SUM(I7:I11)
# Где:
# C12 = lambda_f_grunt = 1.50
# E28 = tau_f = 3624
# E29 = theta_mp = 12.51
# H12 = eta_f_grunt = eta_f для грунта
# E25 = t0 = 1.5
# E26 = eta_f_0 для грунта

eta_f_0_grunt = eta_f_i_values[-1]  # eta_f_0 для грунта

part1 = 1.9 * math.sqrt(2 * lambda_f_grunt * tau_f)
part2 = math.sqrt(theta_mp / eta_f_grunt) - math.sqrt(t0 / eta_f_0_grunt)

Hn = part1 * part2 - sum_sigma

print(f"\nРасчет Hn:")
print(f"part1 = 1.9 * sqrt(2 * {lambda_f_grunt} * {tau_f}) = {part1:.3f}")
print(f"part2 = sqrt({theta_mp}/{eta_f_grunt:.1f}) - sqrt({t0}/{eta_f_0_grunt:.1f}) = {part2:.6f}")
print(f"Hn = {part1:.3f} * {part2:.6f} - {sum_sigma:.3f} = {Hn:.3f} (ожидается 0.82)")