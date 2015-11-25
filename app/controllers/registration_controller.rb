class RegistrationController < ApplicationController
  def index
  end

  def create
    @registration = Registration.new(registration_params)

    redirect_to registration_index_path
  end

  def show
  end

  def task1
  end

  def task2
  end

  def task3
  end

  def task4
  end

  def bonus
  end

  def validate
    reg = Registration.new(registration_params)
    reg.valid?
    errors = reg.errors[params[:registrations].keys.first]

    render json: { valid: errors.none?, errors: errors }
  end

  private

  def registration_params
    params.require(:registrations).permit(:name, :lastname, :email, :age, :gender, :password)
  end
end
